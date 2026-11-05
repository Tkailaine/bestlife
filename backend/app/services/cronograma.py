import os
import re
from datetime import datetime, timedelta
from app.services.mensagens import MENSAGENS_POR_TRILHA, ORDEM_PRIORIDADE


def formatar_telefone(telefone_bruto: str) -> str:
    """
    Remove caracteres especiais e garante o formato internacional com '+' e apenas números.
    Ex: '+81 965-431-3024' -> '+819654313024'
    """
    apenas_digitos = re.sub(r"\D", "", telefone_bruto or "")
    if not apenas_digitos:
        return "+5511999999999"  # Fallback seguro
    return f"+{apenas_digitos}"


def obter_proximo_dia_semana(data_base: datetime, dia_semana: int = 0) -> datetime:
    """
    Calcula a próxima data para o dia da semana configurado (0 = Segunda, 1 = Terça, etc).
    """
    dias_ate_la = (dia_semana - data_base.weekday() + 7) % 7
    if dias_ate_la == 0:
        dias_ate_la = 7  # Sempre joga para a próxima semana
    return data_base + timedelta(days=dias_ate_la)


def calcular_cronograma_envios(clientes: list, data_inicial: datetime = None, dia_semana: int = 0) -> list:
    """
    Gera o calendário completo de envios para os clientes confirmados.
    Regra:
    - 1 mensagem por semana, 3 semanas por trilha, na ordem de prioridade.
    - Por padrão, todos usam 'dia_semana' (padrão global).
    - Se o cliente tiver 'dia_semana_envio' preenchido, usa o dia individual dele.
    """
    agora = datetime.now()
    cronograma = []

    for cliente in clientes:
        primeiro_nome = cliente.nome_completo.split()[0] if cliente.nome_completo else "Cliente"
        telefone_formatado = formatar_telefone(cliente.telefone)

        # Se o cliente tiver um dia da semana individual configurado, usa o dele;
        # caso contrário (None), aplica o dia padrão de todos os clientes.
        dia_individual = getattr(cliente, "dia_semana_envio", None)
        if dia_individual is not None:
            dia_do_cliente = dia_individual
        else:
            dia_do_cliente = dia_semana

        # Define a primeira data de envio deste cliente
        if data_inicial is not None:
            primeira_data_cliente = data_inicial
        else:
            primeira_data_cliente = obter_proximo_dia_semana(agora, dia_do_cliente)

        # Trata as trilhas confirmadas do cliente
        trilhas_cliente = []
        if cliente.trilhas_confirmadas:
            trilhas_cliente = [t.strip() for t in cliente.trilhas_confirmadas.split(",") if t.strip()]

        # Ordena as trilhas pela prioridade oficial do case
        trilhas_ordenadas = [t for t in ORDEM_PRIORIDADE if t in trilhas_cliente]

        # Cada semana avança 7 dias (sempre no mesmo dia da semana do cliente)
        semana_acumulada = 0

        for trilha in trilhas_ordenadas:
            mensagens = MENSAGENS_POR_TRILHA.get(trilha, [])

            for indice_msg, template in enumerate(mensagens, start=1):
                data_prevista = primeira_data_cliente + timedelta(weeks=semana_acumulada)
                texto_formatado = template.replace("{nome}", primeiro_nome)

                cronograma.append({
                    "cliente_id": cliente.id,
                    "nome_cliente": cliente.nome_completo,
                    "primeiro_nome": primeiro_nome,
                    "telefone": telefone_formatado,
                    "trilha": trilha,
                    "numero_mensagem": indice_msg,
                    "semana_relativa": semana_acumulada + 1,
                    "data_envio": data_prevista.strftime("%Y-%m-%d"),
                    "dia_semana": dia_do_cliente,
                    "dia_personalizado": dia_individual is not None,
                    "mensagem": texto_formatado
                })

                semana_acumulada += 1

    # Ordena o cronograma por data de envio
    cronograma.sort(key=lambda item: item["data_envio"])
    return cronograma


def montar_requisicao_setabot(telefone: str, mensagem: str) -> dict:
    """
    Monta exatamente a estrutura HTTP exigida pela API da Setabot (sem fazer o disparo real).
    O token vem obrigatoriamente da variável de ambiente WHATSAPP_API_TOKEN.
    """
    token = os.getenv("WHATSAPP_API_TOKEN", "token_simulado_setabot_12345")
    inbox_id = os.getenv("SETABOT_INBOX_ID", "1")

    return {
        "plataforma": "Setabot",
        "metodo": "POST",
        "url": f"https://crm.setabot.com.br/api/v1/inboxes/{inbox_id}/messages",
        "headers": {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        "body": {
            "phone": telefone,
            "message": mensagem
        }
    }
