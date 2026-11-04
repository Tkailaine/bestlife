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
    payload = {"trilhas": ["Alto valor", "Público jovem"]}
    response = client.post("/clientes/1/confirmar", json=payload)
    assert response.status_code == 200
    resultado = response.json()
    assert resultado["status_confirmacao"] is True
    assert resultado["trilhas_confirmadas"] == ["Alto valor", "Público jovem"]


def test_cronograma_envios():
    """Testa se o cronograma gera mensagens para clientes confirmados"""
    response = client.get("/cronograma")
    assert response.status_code == 200
    cronograma = response.json()
    assert "itens" in cronograma
    assert len(cronograma["itens"]) > 0


def test_simulacao_envio_whatsapp():
    """Testa o disparo simulado de WhatsApp gerando histórico"""
    response = client.post("/simulacao/disparar-hoje")
    assert response.status_code == 200
    dados = response.json()
    assert dados["total_simulados"] > 0
    assert "disparos_simulados" in dados

