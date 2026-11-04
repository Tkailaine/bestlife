import json
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import engine, get_db, Base
from app.models.user import User
from app.models.envio import HistoricoEnvio
from app.services.trilhas import classificar_cliente
from app.services.cronograma import calcular_cronograma_envios, montar_requisicao_setabot

# Cria as tabelas necessárias no SQLite (incluindo a tabela de histórico de envios)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BestLife CRM - API de Clientes & Mensageria")

# Configuração de CORS para permitir que o frontend (React) acesse a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Modelo Pydantic para receber a confirmação de trilhas
class ConfirmarTrilhasRequest(BaseModel):
    trilhas: List[str]


@app.get("/health")
def health_check():
    """Rota para verificar se a API está funcionando."""
    return {"status": "ok"}


@app.get("/clientes")
def listar_clientes(
    trilha: Optional[str] = Query(None, description="Filtrar por nome da trilha"),
    db: Session = Depends(get_db)
):
    """
    Retorna a lista de todos os clientes do banco de dados SQLite.
    Calcula as trilhas sugeridas para cada cliente.
    Permite filtrar por trilha específica (ex: /clientes?trilha=Alto valor).
    """
    clientes_db = db.query(User).all()
    lista_resposta = []

    for cliente in clientes_db:
        trilhas_sugeridas = classificar_cliente(
            valor_total=cliente.valor_total_carrinhos,
            quantidade_itens=cliente.quantidade_total_itens,
            idade=cliente.idade
        )

        nomes_trilhas = [t["nome"] for t in trilhas_sugeridas]

        if trilha and trilha not in nomes_trilhas:
            continue

        lista_resposta.append({
            "id": cliente.id,
            "nome_completo": cliente.nome_completo,
            "idade": cliente.idade,
            "sexo": cliente.sexo,
            "estado": cliente.estado,
            "telefone": cliente.telefone,
            "valor_total_carrinhos": cliente.valor_total_carrinhos,
            "quantidade_total_itens": cliente.quantidade_total_itens,
            "trilhas_sugeridas": trilhas_sugeridas,
            "trilhas_confirmadas": cliente.trilhas_confirmadas.split(", ") if cliente.trilhas_confirmadas else [],
            "status_confirmacao": cliente.status_confirmacao
        })

    return lista_resposta


@app.get("/clientes/{cliente_id}")
def obter_cliente(cliente_id: int, db: Session = Depends(get_db)):
    """
    Retorna os detalhes de um cliente específico com suas trilhas e motivos explicados.
    """
    cliente = db.query(User).filter(User.id == cliente_id).first()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    trilhas_sugeridas = classificar_cliente(
        valor_total=cliente.valor_total_carrinhos,
        quantidade_itens=cliente.quantidade_total_itens,
        idade=cliente.idade
    )

    return {
        "id": cliente.id,
        "nome_completo": cliente.nome_completo,
        "idade": cliente.idade,
        "sexo": cliente.sexo,
        "estado": cliente.estado,
        "telefone": cliente.telefone,
        "valor_total_carrinhos": cliente.valor_total_carrinhos,
        "quantidade_total_itens": cliente.quantidade_total_itens,
        "trilhas_sugeridas": trilhas_sugeridas,
        "trilhas_confirmadas": cliente.trilhas_confirmadas.split(", ") if cliente.trilhas_confirmadas else [],
        "status_confirmacao": cliente.status_confirmacao
    }


@app.post("/clientes/{cliente_id}/confirmar")
def confirmar_trilhas_cliente(
    cliente_id: int,
    dados: ConfirmarTrilhasRequest,
    db: Session = Depends(get_db)
):
    """
    Grava no banco a decisão do analista (confirmação ou ajuste de trilhas).
    Só clientes confirmados entram no cronograma de mensagens.
    """
    cliente = db.query(User).filter(User.id == cliente_id).first()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    cliente.trilhas_confirmadas = ", ".join(dados.trilhas)
    cliente.status_confirmacao = True

    db.commit()
    db.refresh(cliente)

    return {
        "mensagem": "Trilhas confirmadas com sucesso!",
        "cliente_id": cliente.id,
        "trilhas_confirmadas": dados.trilhas,
        "status_confirmacao": cliente.status_confirmacao
    }


# ==========================================
# CRONOGRAMA DE ENVIOS E SIMULAÇÃO WHATSAPP
# ==========================================

@app.get("/cronograma")
def obter_cronograma(db: Session = Depends(get_db)):
    """
    Gera o calendário de mensagens previstas para as próximas semanas.
    Regra do case: Só clientes confirmados entram no cronograma!
    """
    clientes_confirmados = db.query(User).filter(User.status_confirmacao == True).all()

    if not clientes_confirmados:
        return {
            "total_envios": 0,
            "mensagem": "Nenhum cliente confirmado ainda. Confirme as trilhas de clientes para gerar o cronograma.",
            "itens": []
        }

    itens_cronograma = calcular_cronograma_envios(clientes_confirmados)

    return {
        "total_envios": len(itens_cronograma),
        "total_clientes_confirmados": len(clientes_confirmados),
        "itens": itens_cronograma
    }


@app.post("/simulacao/disparar-hoje")
def simular_envios_de_hoje(db: Session = Depends(get_db)):
    """
    Simula o disparo das mensagens agendadas para o lote atual (Setabot WhatsApp).
    - Converte telefone para o padrão da API.
    - Substitui {nome} pelo primeiro nome.
    - Monta o JSON da requisição com Headers (Bearer TOKEN do .env) e Body.
    - NÃO faz a chamada real; salva no histórico para auditoria.
    """
    clientes_confirmados = db.query(User).filter(User.status_confirmacao == True).all()

    if not clientes_confirmados:
        raise HTTPException(
            status_code=400,
            detail="Não há clientes confirmados para simular envios."
        )

    itens_cronograma = calcular_cronograma_envios(clientes_confirmados)

    if not itens_cronograma:
        return {"mensagem": "Nenhuma mensagem prevista no cronograma.", "total_simulados": 0}

    # Pega a data do primeiro lote a ser disparado (primeira data prevista)
    primeira_data = itens_cronograma[0]["data_envio"]
    envios_do_lote = [item for item in itens_cronograma if item["data_envio"] == primeira_data]

    simulacoes_geradas = []

    for item in envios_do_lote:
        # Monta a requisição oficial da Setabot
        req_setabot = montar_requisicao_setabot(
            telefone=item["telefone"],
            mensagem=item["mensagem"]
        )

        # Grava no banco de dados SQLite para auditoria
        historico = HistoricoEnvio(
            cliente_id=item["cliente_id"],
            nome_cliente=item["nome_cliente"],
            telefone=item["telefone"],
            trilha=item["trilha"],
            mensagem=item["mensagem"],
            data_envio=item["data_envio"],
            requisicao_simulada=json.dumps(req_setabot, ensure_ascii=False, indent=2)
        )
        db.add(historico)
        simulacoes_geradas.append({
            "cliente": item["nome_cliente"],
            "telefone": item["telefone"],
            "mensagem": item["mensagem"],
            "requisicao": req_setabot
        })

    db.commit()

    return {
        "mensagem": f"Simulação de envios concluída com sucesso para a data {primeira_data}!",
        "total_simulados": len(simulacoes_geradas),
        "data_lote": primeira_data,
        "disparos_simulados": simulacoes_geradas
    }


@app.get("/simulacao/historico")
def listar_historico_envios(db: Session = Depends(get_db)):
    """
    Retorna todo o histórico de simulações salvas no banco.
    """
    registros = db.query(HistoricoEnvio).order_by(HistoricoEnvio.criado_em.desc()).all()
    resultado = []

    for r in registros:
        resultado.append({
            "id": r.id,
            "cliente_id": r.cliente_id,
            "nome_cliente": r.nome_cliente,
            "telefone": r.telefone,
            "trilha": r.trilha,
            "mensagem": r.mensagem,
            "data_envio": r.data_envio,
            "criado_em": r.criado_em.strftime("%Y-%m-%d %H:%M:%S") if r.criado_em else None,
            "requisicao_simulada": json.loads(r.requisicao_simulada) if r.requisicao_simulada else {}
        })

    return resultado
