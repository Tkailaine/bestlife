import sys
import os
import pytest
from fastapi.testclient import TestClient

# Adiciona a pasta backend para conseguir importar a app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)


def test_health_check():
    """Testa se a API responde ok na rota /health"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_listar_clientes():
    """Testa se a lista de clientes retorna 200 e contém clientes"""
    response = client.get("/clientes")
    assert response.status_code == 200
    dados = response.json()
    assert isinstance(dados, list)
    assert len(dados) > 0


def test_obter_cliente_detalhes():
    """Testa a busca de um cliente específico pelo ID"""
    response = client.get("/clientes/1")
    assert response.status_code == 200
    cliente = response.json()
    assert cliente["id"] == 1
    assert "nome_completo" in cliente
    assert "trilhas_sugeridas" in cliente


def test_confirmar_trilhas():
    """Testa a confirmação de trilhas pelo analista"""
    payload = {"trilhas": ["Alto valor", "Público jovem"], "dia_semana_envio": None}
    response = client.post("/clientes/1/confirmar", json=payload)
    assert response.status_code == 200
    resultado = response.json()
    assert resultado["status_confirmacao"] is True
    assert resultado["trilhas_confirmadas"] == ["Alto valor", "Público jovem"]


def test_configurar_dia_semana_padrao_e_individual():
    """Testa a persistência do dia da semana padrão e do dia individual por cliente"""
    # 1. Configura Terça-feira (1) como padrão global e verifica se persiste
    res_padrao = client.post("/cronograma/configurar-dia", json={"dia_semana_padrao": 1})
    assert res_padrao.status_code == 200
    assert res_padrao.json()["dia_semana_padrao"] == 1

    cronograma = client.get("/cronograma").json()
    assert cronograma["dia_semana_padrao"] == 1

    # 2. Configura Sexta-feira (4) exclusivamente para o cliente #1 (ex: Black Friday)
    res_ind = client.post(
        "/clientes/1/confirmar",
        json={"trilhas": ["Alto valor", "Público jovem"], "dia_semana_envio": 4}
    )
    assert res_ind.status_code == 200
    assert res_ind.json()["dia_semana_envio"] == 4

    cronograma_ind = client.get("/cronograma").json()
    item_c1 = [i for i in cronograma_ind["itens"] if i["cliente_id"] == 1][0]
    assert item_c1["dia_semana"] == 4
    assert item_c1["dia_personalizado"] is True

    # Restaura o cliente #1 para seguir o padrão geral (None) e o padrão para Segunda (0)
    client.post(
        "/clientes/1/confirmar",
        json={"trilhas": ["Alto valor", "Público jovem"], "dia_semana_envio": None}
    )
    client.post("/cronograma/configurar-dia", json={"dia_semana_padrao": 0})


def test_cronograma_envios():
    """Testa se o cronograma gera mensagens para clientes confirmados"""
    response = client.get("/cronograma")
    assert response.status_code == 200
    cronograma = response.json()
    assert "itens" in cronograma
    assert len(cronograma["itens"]) > 0


def test_simulacao_envio_whatsapp():
    """Testa o disparo simulado de WhatsApp gerando histórico sem duplicar envios"""
    response_1 = client.post("/simulacao/disparar-hoje")
    assert response_1.status_code == 200
    dados_1 = response_1.json()
    assert dados_1["total_simulados"] > 0
    assert "disparos_simulados" in dados_1

    historico_antes = client.get("/simulacao/historico").json()

    # Dispara novamente no mesmo dia e garante que não duplica registros no histórico
    response_2 = client.post("/simulacao/disparar-hoje")
    assert response_2.status_code == 200
    historico_depois = client.get("/simulacao/historico").json()
    assert len(historico_depois) == len(historico_antes)
