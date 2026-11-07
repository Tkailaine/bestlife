from pathlib import Path
import json
from datetime import datetime
import requests


# 1. Função que vai até a DummyJSON e traz a lista completa respeitando a paginação
def buscar_todos_registros(url: str, chave_recurso: str, limite: int = 50) -> list:
    todos_itens = []
    skip = 0

    while True:
        parametros = {"limit": limite, "skip": skip}

        # Tratamento de erro caso a API da DummyJSON não responda ou caia
        try:
            res = requests.get(url, params=parametros, timeout=10)
            res.raise_for_status()
        except requests.exceptions.Timeout:
            print(f"[ERRO] Tempo limite esgotado (timeout) ao tentar acessar: {url}")
            break
        except requests.exceptions.ConnectionError:
            print(f"[ERRO] Falha de conexão. A API não está respondendo: {url}")
            break
        except requests.exceptions.RequestException as erro:
            print(f"[ERRO] Erro inesperado na requisição para {url}: {erro}")
            break

        data = res.json()
        itens = data.get(chave_recurso, [])
        todos_itens.extend(itens)

        total = data.get("total", 0)
        skip += limite

        # Se já buscamos tudo ou a página veio vazia, encerra o loop
        if skip >= total or not itens:
            break

    # Retorna a lista completa só DEPOIS que o loop terminou
    return todos_itens


# 2. Função que salva a lista em um arquivo JSON com data e hora
def salvar_json_bruto(dados: list, nome_recurso: str, pasta_base: Path) -> Path:
    agora = datetime.now()
    pasta_data = agora.strftime("%Y-%m-%d")
    horario = agora.strftime("%H-%M-%S")

    # Garante a pasta data/raw/AAAA-MM-DD
    pasta_destino = pasta_base / pasta_data
    pasta_destino.mkdir(parents=True, exist_ok=True)

    # Cria o nome do arquivo com a hora exata
    caminho_arquivo = pasta_destino / f"{nome_recurso}_{horario}.json"

    with open(caminho_arquivo, "w", encoding="utf-8") as arquivo:
        json.dump(dados, arquivo, ensure_ascii=False, indent=2)

    return caminho_arquivo


# 3. Função principal de extração
def main():
    # Encontra a raiz do projeto 
    raiz_projeto = Path(__file__).resolve().parent.parent.parent
    pasta_raw = raiz_projeto / "data" / "raw"

    print("=" * 40)
    print("Iniciando busca de dados na DummyJSON...")
    print("=" * 40)

    # Busca e salva usuários
    usuarios = buscar_todos_registros("https://dummyjson.com/users", chave_recurso="users")
    if not usuarios:
        print("[ERRO] Não foi possível buscar os usuários. Extração cancelada.")
        return

    caminho_usuarios = salvar_json_bruto(usuarios, "users", pasta_raw)
    print(f"Salvos {len(usuarios)} usuários em: {caminho_usuarios}")

    # Busca e salva carrinhos
    carrinhos = buscar_todos_registros("https://dummyjson.com/carts", chave_recurso="carts")
    if not carrinhos:
        print("[ERRO] Não foi possível buscar os carrinhos. Extração cancelada.")
        return

    caminho_carrinhos = salvar_json_bruto(carrinhos, "carts", pasta_raw)
    print(f"Salvos {len(carrinhos)} carrinhos em: {caminho_carrinhos}")

    print("=" * 40)
    print("Extração concluída com sucesso!")
    print("=" * 40)


if __name__ == "__main__":
    main()
