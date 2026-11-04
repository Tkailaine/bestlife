import os
import json
import sys

# Adiciona a pasta backend para conseguir importar app.database e app.models
caminho_backend = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(caminho_backend)

from app.database import engine, SessionLocal, Base
from app.models.user import User


def popular_banco():
    # 1. Cria a tabela clientes no SQLite caso ainda não exista
    print("Criando tabelas no banco de dados...")
    Base.metadata.create_all(bind=engine)

    # 2. Localiza a pasta mais recente dentro de data/raw/
    pasta_raw = os.path.join("data", "raw")
    pastas_datas = sorted(os.listdir(pasta_raw))
    pasta_recente = os.path.join(pasta_raw, pastas_datas[-1])

    # 3. Pega os arquivos de usuários e carrinhos
    todos_arquivos = sorted(os.listdir(pasta_recente))
    
    arquivo_users = None
    arquivo_carts = None

    for arquivo in todos_arquivos:
        if arquivo.startswith("users_"):
            arquivo_users = os.path.join(pasta_recente, arquivo)
        elif arquivo.startswith("carts_"):
            arquivo_carts = os.path.join(pasta_recente, arquivo)

    print(f"Lendo usuários de: {arquivo_users}")
    with open(arquivo_users, "r", encoding="utf-8") as f:
        lista_usuarios = json.load(f)

    print(f"Lendo carrinhos de: {arquivo_carts}")
    with open(arquivo_carts, "r", encoding="utf-8") as f:
        lista_carrinhos = json.load(f)

    # 4. Abre a sessão com o banco
    db = SessionLocal()

    print("Processando clientes...")
    for usuario in lista_usuarios:
        id_usuario = usuario["id"]

        # Calcula a soma dos carrinhos que pertencem a esse usuário
        valor_total = 0.0
        quantidade_itens = 0

        for carrinho in lista_carrinhos:
            if carrinho["userId"] == id_usuario:
                valor_total = valor_total + carrinho["total"]
                quantidade_itens = quantidade_itens + carrinho["totalQuantity"]

        # Pega o primeiro nome e sobrenome
        primeiro_nome = usuario.get("firstName", "")
        sobrenome = usuario.get("lastName", "")
        nome_completo = f"{primeiro_nome} {sobrenome}".strip()

        # Pega o estado dentro do endereço
        endereco = usuario.get("address", {})
        estado = endereco.get("state", "")

        # Cria o cliente com os dados consolidados
        cliente = User(
            id=id_usuario,
            nome_completo=nome_completo,
            idade=usuario.get("age", 0),
            sexo=usuario.get("gender", ""),
            estado=estado,
            telefone=usuario.get("phone", ""),
            valor_total_carrinhos=round(valor_total, 2),
            quantidade_total_itens=quantidade_itens
        )

        # Insere ou atualiza o cliente no banco
        db.merge(cliente)

    # Salva as alterações e fecha a conexão
    db.commit()
    db.close()

    print(f"Sucesso! {len(lista_usuarios)} clientes salvos no banco SQLite.")


if __name__ == "__main__":
    popular_banco()
