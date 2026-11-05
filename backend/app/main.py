import json
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import engine, get_db, Base
from app.models.user import User
from app.models.envio import HistoricoEnvio, ConfiguracaoCronograma
from app.services.trilhas import classificar_cliente
from app.services.cronograma import calcular_cronograma_envios, montar_requisicao_setabot

# Cria as tabelas necessárias no SQLite (clientes, histórico e configuração de cronograma)
Base.metadata.create_all(bind=engine)

# Garante que a coluna dia_semana_envio exista em bancos já criados anteriormente
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE clientes ADD COLUMN dia_semana_envio INTEGER"))
        conn.commit()
    except Exception:
        pass

app = FastAPI(title="BestLife CRM - API de Clientes & Mensageria")

# Configuração de CORS para permitir que o frontend (React) acesse a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Modelos Pydantic para receber dados do frontend
class ConfirmarTrilhasRequest(BaseModel):
    trilhas: List[str]
    dia_semana_envio: Optional[int] = None


class ConfigurarDiaRequest(BaseModel):
    dia_semana_padrao: int


def obter_dia_padrao_banco(db: Session) -> int:
    """
    Busca no SQLite o dia da semana padrão configurado pelo analista.
    Se ainda não houver configuração salva, cria com 0 (Segunda-feira).
    """
    config = db.query(ConfiguracaoCronograma).first()
    if not config:
        config = ConfiguracaoCronograma(dia_semana_padrao=0)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config.dia_semana_padrao


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
            "status_confirmacao": cliente.status_confirmacao,
            "dia_semana_envio": cliente.dia_semana_envio
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
        "status_confirmacao": cliente.status_confirmacao,
        "dia_semana_envio": cliente.dia_semana_envio
    }


@app.post("/clientes/{cliente_id}/confirmar")
def confirmar_trilhas_cliente(
    cliente_id: int,
    dados: ConfirmarTrilhasRequest,
    db: Session = Depends(get_db)
):
    """
    Grava no banco a decisão do analista:
    - Trilhas confirmadas
    - Dia da semana personalizado (ou None para usar o dia padrão de todos)
    """
    cliente = db.query(User).filter(User.id == cliente_id).first()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    cliente.trilhas_confirmadas = ", ".join(dados.trilhas)
    cliente.status_confirmacao = True
    cliente.dia_semana_envio = dados.dia_semana_envio

    db.commit()
    db.refresh(cliente)

    return {
        "mensagem": "Trilhas confirmadas com sucesso!",
        "cliente_id": cliente.id,
        "trilhas_confirmadas": dados.trilhas,
        "status_confirmacao": cliente.status_confirmacao,
        "dia_semana_envio": cliente.dia_semana_envio
    }


# ==========================================
# CRONOGRAMA DE ENVIOS E SIMULAÇÃO WHATSAPP
# ==========================================

@app.get("/cronograma")
def obter_cronograma(db: Session = Depends(get_db)):
    """
    Gera o calendário de mensagens previstas para as próximas semanas.
    Usa o dia padrão salvo no banco, respeitando o dia individual de quem tiver personalização.
    """
    dia_padrao = obter_dia_padrao_banco(db)
    clientes_confirmados = db.query(User).filter(User.status_confirmacao == True).all()

    if not clientes_confirmados:
        return {
            "total_envios": 0,
            "total_clientes_confirmados": 0,
            "dia_semana_padrao": dia_padrao,
            "mensagem": "Nenhum cliente confirmado ainda. Confirme as trilhas de clientes para gerar o cronograma.",
            "itens": []
        }

    itens_cronograma = calcular_cronograma_envios(
        clientes_confirmados,
        dia_semana=dia_padrao
    )

    return {
        "total_envios": len(itens_cronograma),
        "total_clientes_confirmados": len(clientes_confirmados),
        "dia_semana_padrao": dia_padrao,
        "itens": itens_cronograma
    }


@app.post("/cronograma/configurar-dia")
def configurar_dia_semana_padrao(
    dados: ConfigurarDiaRequest,
    db: Session = Depends(get_db)
):
    """
    Salva no banco SQLite o dia da semana padrão para todos os clientes que não possuem dia individual.
    0 = Segunda, 1 = Terça, 2 = Quarta, 3 = Quinta, 4 = Sexta.
    """
    if dados.dia_semana_padrao < 0 or dados.dia_semana_padrao > 6:
        raise HTTPException(status_code=400, detail="Dia da semana inválido.")

    config = db.query(ConfiguracaoCronograma).first()
    if not config:
        config = ConfiguracaoCronograma(dia_semana_padrao=dados.dia_semana_padrao)
        db.add(config)
    else:
        config.dia_semana_padrao = dados.dia_semana_padrao

    db.commit()
    db.refresh(config)

    return {
        "mensagem": "Dia da semana padrão atualizado com sucesso!",
        "dia_semana_padrao": config.dia_semana_padrao
    }


@app.post("/simulacao/disparar-hoje")
def simular_envios_de_hoje(db: Session = Depends(get_db)):
    """
    Simula o disparo das mensagens agendadas para o próximo lote (Setabot WhatsApp).
    """
    dia_padrao = obter_dia_padrao_banco(db)
    clientes_confirmados = db.query(User).filter(User.status_confirmacao == True).all()

    if not clientes_confirmados:
        raise HTTPException(
            status_code=400,
            detail="Não há clientes confirmados para simular envios."
        )

    itens_cronograma = calcular_cronograma_envios(
        clientes_confirmados,
        dia_semana=dia_padrao
    )

    if not itens_cronograma:
        return {"mensagem": "Nenhuma mensagem prevista no cronograma.", "total_simulados": 0}

    # Pega a primeira mensagem de cada cliente confirmado (Semana 1 de cada cliente)
    envios_do_lote = [item for item in itens_cronograma if item["semana_relativa"] == 1]
    primeira_data = envios_do_lote[0]["data_envio"] if envios_do_lote else itens_cronograma[0]["data_envio"]

    simulacoes_geradas = []
    novos_registros = 0

    for item in envios_do_lote:
        req_setabot = montar_requisicao_setabot(
            telefone=item["telefone"],
            mensagem=item["mensagem"]
        )
        json_requisicao = json.dumps(req_setabot, ensure_ascii=False, indent=2)

        # Verifica se já existe simulação salva para este cliente, trilha e data (evita duplicatas)
        envio_existente = db.query(HistoricoEnvio).filter(
            HistoricoEnvio.cliente_id == item["cliente_id"],
            HistoricoEnvio.trilha == item["trilha"],
            HistoricoEnvio.data_envio == item["data_envio"]
        ).first()

        if envio_existente:
            envio_existente.mensagem = item["mensagem"]
            envio_existente.requisicao_simulada = json_requisicao
        else:
            historico = HistoricoEnvio(
                cliente_id=item["cliente_id"],
                nome_cliente=item["nome_cliente"],
                telefone=item["telefone"],
                trilha=item["trilha"],
                mensagem=item["mensagem"],
                data_envio=item["data_envio"],
                requisicao_simulada=json_requisicao
            )
            db.add(historico)
            novos_registros += 1

        simulacoes_geradas.append({
            "cliente": item["nome_cliente"],
            "telefone": item["telefone"],
            "mensagem": item["mensagem"],
            "requisicao": req_setabot
        })

    db.commit()

    return {
        "mensagem": f"Simulação de envios concluída com sucesso!",
        "total_simulados": len(simulacoes_geradas),
        "novos_registrados": novos_registros,
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
