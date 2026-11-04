from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.services.trilhas import classificar_cliente

app = FastAPI(title="BestLife CRM - API de Clientes")

# Configuração de CORS para permitir que o frontend (React) acesse a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em desenvolvimento, permite chamadas do frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Modelo Pydantic para receber o corpo da requisição de confirmação do analista
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
        # Calcula as trilhas sugeridas usando a nossa regra de negócio
        trilhas_sugeridas = classificar_cliente(
            valor_total=cliente.valor_total_carrinhos,
            quantidade_itens=cliente.quantidade_total_itens,
            idade=cliente.idade
        )

        nomes_trilhas = [t["nome"] for t in trilhas_sugeridas]

        # Se houver filtro de trilha, ignora os clientes que não estão nela
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
    Retorna os detalhes de um cliente específico com suas trilhas e motivos detalhados.
    """
    cliente = db.query(User).filter(User.id == cliente_id).first()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    # Calcula as trilhas sugeridas com os motivos explicados
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

    # Salva as trilhas escolhidas pelo analista como texto separado por vírgula
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
