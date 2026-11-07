def formatar_reais(valor: float) -> str:
    # Formata o número no padrão brasileiro (Ex: 186110.85 -> "186.110,85")
    valor_formatado = f"{valor:,.2f}"
    valor_formatado = valor_formatado.replace(",", "X").replace(".", ",").replace("X", ".")
    return valor_formatado


def classificar_cliente(valor_total: float, quantidade_itens: int, idade: int) -> list:
    trilhas = []
    valor_br = formatar_reais(valor_total)

    # Prioridade 1: Alto valor
    if valor_total >= 10000.0:
        trilhas.append({
            "nome": "Alto valor",
            "motivo": f"valor total R$ {valor_br} ≥ R$ 10.000"
        })

    # Prioridade 2: Compra em quantidade
    if quantidade_itens >= 15:
        trilhas.append({
            "nome": "Compra em quantidade",
            "motivo": f"itens {quantidade_itens} ≥ 15"
        })

    # Prioridade 3: Incentivo
    if valor_total < 1000.0:
        trilhas.append({
            "nome": "Incentivo",
            "motivo": f"valor total R$ {valor_br} < R$ 1.000"
        })

    # Prioridade 4: Público jovem
    if idade < 30:
        trilhas.append({
            "nome": "Público jovem",
            "motivo": f"idade {idade} < 30"
        })

    # Prioridade 5: Geral (só se não entrou em nenhuma das anteriores)
    if len(trilhas) == 0:
        trilhas.append({
            "nome": "Geral",
            "motivo": "não se encaixou em nenhuma das anteriores"
        })

    return trilhas