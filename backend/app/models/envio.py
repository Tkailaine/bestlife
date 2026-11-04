from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database import Base


class HistoricoEnvio(Base):
    __tablename__ = "historico_envios"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, nullable=False)
    nome_cliente = Column(String, nullable=False)
    telefone = Column(String, nullable=False)
    trilha = Column(String, nullable=False)
    mensagem = Column(Text, nullable=False)
    data_envio = Column(String, nullable=False)  # Data prevista do envio (ex: 2026-11-09)
    
    # Guarda o JSON completo da requisição (endpoint, método, cabeçalhos e corpo)
    requisicao_simulada = Column(Text, nullable=False)
    
    # Data e hora exatas de quando a simulação foi gerada
    criado_em = Column(DateTime, default=datetime.now)

