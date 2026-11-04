import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

#Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

#Lê a URL do banco do ambiente
DATABASE_URL=os.getenv("DATABASE_URL")

#permite várias conexões ao mesmo tempo para o FASTAPI
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

#Conexão com o banco de dados
engine = create_engine(DATABASE_URL, connect_args=connect_args)

#Criador de sessões
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#base que será usada nos modelos
Base = declarative_base()

#Função principal para abrir conexão no banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()