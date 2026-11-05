import os
from datetime import datetime, timedelta
from app.services.mensagens import MENSAGENS_POR_TRILHA, ORDEM_PRIORIDADE


# 1. Limpa o telefone deixando apenas "+" e números (Ex: "+81 965-431-3024" -> "+819654313024")
def formatar_telefone(telefone_bruto: str) -> str:
    apenas_numeros = ""

    for caractere in (telefone_bruto or ""):
        if caractere.isdigit():
            apenas_numeros = apenas_numeros + caractere

    if not apenas_numeros:
        return "+5511999999999"

    return f"+{apenas_numeros}"


# 2. Descobre qual é a data do próximo dia da semana escolhido (0 = Segunda, 1 = Terça, etc.)
def obter_proximo_dia_semana(data_base: datetime, dia_semana: int = 0) -> datetime:
    # Começa olhando para amanhã (+1 dia)
    proxima_data = data_base + timedelta(days=1)

    # Vai avançando de 1 em 1 dia no calendário até cair no dia da semana escolhido
    while proxima_data.weekday() != dia_semana:
        proxima_data = proxima_data + timedelta(days=1)

    return proxima_data


# 3. Gera a lista de envios semanais de todos os clientes confirmados
def calcular_cronograma_envios(clientes: list, dia_semana: int = 0) -> list:
    agora = datetime.now()
    cronograma = []

    for cliente in clientes:
        # Pega só o primeiro nome (Ex: "Emily Johnson" -> "Emily")
        partes_nome = cliente.nome_completo.split()
        primeiro_nome = partes_nome[0] if partes_nome else "Cliente"

        # Limpa o telefone para o padrão do WhatsApp
        telefone_formatado = formatar_telefone(cliente.telefone)

        # Verifica se o cliente tem um dia da semana individual salvo no banco;
        # se não tiver (None), usa o dia_semana padrão de todos os clientes
        if cliente.dia_semana_envio is not None:
            dia_do_cliente = cliente.dia_semana_envio
            tem_dia_personalizado = True
        else:
            dia_do_cliente = dia_semana
            tem_dia_personalizado = False

        # Calcula a data da Semana 1 deste cliente (usando a função que acabamos de ver!)
        primeira_data_cliente = obter_proximo_dia_semana(agora, dia_do_cliente)

        # Transforma o texto do banco ("Alto valor, Público jovem") em uma lista Python
        trilhas_cliente = []
        if cliente.trilhas_confirmadas:
            for pedaco in cliente.trilhas_confirmadas.split(","):
                nome_limpo = pedaco.strip()
                if nome_limpo:
                    trilhas_cliente.append(nome_limpo)

        # Coloca as trilhas do cliente na Ordem de Prioridade Oficial (1ª até 5ª)
        trilhas_ordenadas = []
        for trilha_oficial in ORDEM_PRIORIDADE:
            if trilha_oficial in trilhas_cliente:
                trilhas_ordenadas.append(trilha_oficial)

        # Contador de semanas: começa em 0 e soma +1 a cada mensagem agendada
        semana_acumulada = 0

        for trilha in trilhas_ordenadas:
            mensagens = MENSAGENS_POR_TRILHA.get(trilha, [])
            numero_msg = 1

            for template in mensagens:
                # Soma 'semana_acumulada' semanas (de 7 em 7 dias) a partir da 1ª data
                data_prevista = primeira_data_cliente + timedelta(weeks=semana_acumulada)

                # Troca "{nome}" pelo primeiro nome do cliente
                texto_formatado = template.replace("{nome}", primeiro_nome)

                cronograma.append({
                    "cliente_id": cliente.id,
                    "nome_cliente": cliente.nome_completo,
                    "primeiro_nome": primeiro_nome,
                    "telefone": telefone_formatado,
                    "trilha": trilha,
                    "numero_mensagem": numero_msg,
                    "semana_relativa": semana_acumulada + 1,
                    "data_envio": data_prevista.strftime("%Y-%m-%d"),
                    "dia_semana": dia_do_cliente,
                    "dia_personalizado": tem_dia_personalizado,
                    "mensagem": texto_formatado
                })

                numero_msg = numero_msg + 1
                semana_acumulada = semana_acumulada + 1

    # Ordena a lista final pela data de envio (da mais próxima para a mais distante)
    cronograma.sort(key=lambda item: item["data_envio"])
    return cronograma


# 4. Monta o dicionário (JSON) no formato exigido pela plataforma Setabot WhatsApp
def montar_requisicao_setabot(telefone: str, mensagem: str) -> dict:
    # Lê o token secreto e o ID da caixa de entrada lá do arquivo .env
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
