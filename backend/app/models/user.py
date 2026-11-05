from sqlalchemy import Column, Integer, String, Float, Boolean
from app.database import Base


class User(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nome_completo = Column(String, nullable=False)
    idade = Column(Integer, nullable=False)
    sexo = Column(String, nullable=True)
    estado = Column(String, nullable=True)
    telefone = Column(String, nullable=False)

    # Dados a partir dos carrinhos
    valor_total_carrinhos = Column(Float, default=0.0, nullable=False)
    quantidade_total_itens = Column(Integer, default=0, nullable=False)

    # Trilhas e controle do analista
    trilhas_confirmadas = Column(String, nullable=True)
    status_confirmacao = Column(Boolean, default=False)

    # Dia da semana individual (0=Segunda ... 4=Sexta, ou None para seguir o padrão geral)
    dia_semana_envio = Column(Integer, nullable=True, default=None)
