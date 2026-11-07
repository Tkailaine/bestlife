# BestLife — Automação de Mensagens Semanais & CRM de Clientes

Projeto de extração de dados, classificação em trilhas de relacionamento, cronograma semanal e simulação de envios via WhatsApp desenvolvido para o case técnico da **Best Life Gestão de Pessoas e Serviços Ltda**.

## 📌 Sobre o projeto

O projeto foi desenvolvido para substituir o controle manual feito em planilhas por uma aplicação que automatiza a comunicação semanal de uma loja online de acordo com o perfil de compra de cada cliente.

A solução consome os dados de clientes e carrinhos da API pública **DummyJSON**, consolida o histórico em banco **SQLite**, sugere trilhas com base em regras de prioridade e oferece um painel web para que o analista aprove ou ajuste as trilhas antes de gerar o cronograma e simular os disparos no formato da API **Setabot**.

O sistema entrega:
- Extração paginada de clientes e carrinhos (`data/raw/AAAA-MM-DD/`);
- Consolidação de compras por cliente em banco SQLite;
- Classificação automática em 5 trilhas com motivo explicado;
- Painel do analista para confirmação ou ajuste de trilhas;
- Cronograma semanal configurável (dia padrão geral ou individual por cliente);
- Simulação de disparos via WhatsApp (Setabot API) com histórico salvo no banco.

## 🖥️ Dashboard & Interface

A aplicação web permite visualizar rapidamente os indicadores da carteira e partir da visão geral para a decisão individual de cada cliente:
- **Visão Executiva**: total de clientes, pendentes de revisão, confirmados no cronograma e clientes de maior impacto financeiro;
- **Carteira de Clientes**: busca por nome, UF ou telefone, filtros por trilha e por status (`Todos`, `Pendentes`, `Confirmados`);
- **Inspeção do Cliente**: detalhamento do perfil, critérios que motivaram cada trilha e confirmação pelo analista;
- **Cronograma & Simulação**: calendário de envios semanais e disparo simulado com visualização do JSON da requisição.

## 🎯 Classificação em trilhas

Cada cliente pode entrar em mais de uma trilha. Para cada trilha sugerida, o sistema apresenta o motivo exato calculado sobre os dados do cliente, respeitando a ordem de prioridade:

| Prioridade | Trilha | Regra | Exemplo de motivo |
| :---: | :--- | :--- | :--- |
| 1 | Alto valor | valor total ≥ 10.000 | `valor total R$ 13.037,88 ≥ R$ 10.000` |
| 2 | Compra em quantidade | itens ≥ 15 | `itens 21 ≥ 15` |
| 3 | Incentivo | valor total < 1.000 | `valor total R$ 459,74 < R$ 1.000` |
| 4 | Público jovem | idade < 30 | `idade 28 < 30` |
| 5 | Geral | não se encaixou nas anteriores | `não se encaixou em nenhuma das anteriores` |

## 🔎 Detalhamento de um cliente

Ao selecionar um cliente na lista, o analista visualiza os dados consolidados e registra sua decisão no banco. **Somente clientes confirmados entram no cronograma.**

| Informação | Objetivo |
| :--- | :--- |
| Dados cadastrais | Identificar ID, nome completo, idade, sexo, estado e telefone |
| Total em compras | Exibir a soma do valor de todos os carrinhos do cliente |
| Volume de itens | Exibir a quantidade total de itens comprados |
| Trilhas e motivos | Mostrar quais regras foram atendidas por aquele perfil |
| Diagnóstico comercial | Destacar clientes VIP pendentes ou próximos de faixas superiores |
| Ajuste de trilhas | Permitir confirmar a sugestão automática ou personalizar as trilhas |
| Dia de envio | Seguir o dia padrão da operação ou definir um dia exclusivo para o cliente |

## 📅 Cronograma e mensagens

O cronograma organiza os envios das próximas semanas seguindo as regras do case:
- Cada trilha possui **3 mensagens**, enviadas **uma por semana**, sempre no mesmo dia da semana (configurável);
- O cliente realiza **uma trilha por vez**, na ordem de prioridade: conclui as 3 semanas da primeira trilha e só então inicia a próxima;
- Nas mensagens, `{nome}` é substituído pelo **primeiro nome** do cliente e o telefone é convertido para o padrão internacional (`+` e dígitos).

## 🧪 Simulação de envios (Setabot WhatsApp)

A simulação monta a requisição exatamente como exige a documentação da **Setabot** (`POST https://crm.setabot.com.br/api/v1/inboxes/{inbox_id}/messages`), utilizando `WHATSAPP_API_TOKEN` via variável de ambiente, sem realizar chamada externa real.

```text
DummyJSON API (/users e /carts)
  ↓
Extração Paginada (data/raw/AAAA-MM-DD/)
  ↓
Consolidação no SQLite (Tabela clientes)
  ↓
Classificação em Trilhas + Aprovação do Analista
  ↓
Cronograma Semanal (3 semanas por trilha)
  ↓
Simulação Setabot API + Gravação no Histórico
```

## 🏗️ Arquitetura

- **Extração (ETL)**: scripts Python que buscam todos os registros paginados da DummyJSON e populam o banco;
- **Back-end**: API REST em FastAPI com regras de negócio, cronograma e simulação;
- **Persistência**: banco SQLite gerenciado via SQLAlchemy;
- **Front-end**: aplicação React + TypeScript + Tailwind CSS.

```text
┌─────────────────────────┐
│    DummyJSON API        │
│   /users  &  /carts     │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│   Scripts de Extração   │
│  data/raw/AAAA-MM-DD/   │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│     SQLite + FastAPI    │
│ Trilhas & Cronograma    │
└────────────▲────────────┘
             ▼
┌─────────────────────────┐
│    React Dashboard      │
│ TypeScript + Tailwind   │
└─────────────────────────┘
```

## 🛠️ Tecnologias

| Tecnologia | Utilização |
| :--- | :--- |
| Python + Requests | Extração paginada da API DummyJSON e processamento de dados |
| FastAPI + Uvicorn | Construção da API REST e documentação automática |
| SQLite + SQLAlchemy | Persistência de clientes, configurações e histórico de envios |
| Pytest + GitHub Actions | Testes automatizados da API executados em CI |
| React + TypeScript | Construção da interface web e tipagem de dados |
| Tailwind CSS + Vite | Estilização e ambiente de desenvolvimento front-end |

## 🔐 Preservação de dados e Idempotência

- **Histórico bruto preservado**: os arquivos extraídos são salvos em `data/raw/AAAA-MM-DD/` com hora no nome (`users_HH-MM-SS.json` e `carts_HH-MM-SS.json`), garantindo que novas execuções nunca sobrescrevam arquivos anteriores.
- **Evitação de duplicatas**: tanto a carga no banco (`db.merge`) quanto a simulação de disparos verificam se o registro já existe para o mesmo cliente, trilha e data antes de inserir no histórico.

## 🧪 Testes realizados

Os testes automatizados em `backend/tests/test_api.py` rodam localmente com `pytest` e automaticamente no **GitHub Actions** (`.github/workflows/tests.yml`), validando:
- Status da API (`/health`), listagem (`/clientes`) e detalhamento (`/clientes/{id}`);
- Confirmação de trilhas pelo analista (`/clientes/{id}/confirmar`);
- Configuração do dia da semana padrão e individual (`/cronograma/configurar-dia`);
- Cálculo do cronograma semanal (`/cronograma`);
- Simulação de disparos WhatsApp e não duplicação no histórico (`/simulacao/disparar-hoje`).

## 📂 Estrutura do projeto

```text
bestlife/
├── .github/workflows/tests.yml      # Testes automatizados no GitHub Actions
├── backend/
│   ├── app/
│   │   ├── models/                  # Modelos SQLite (clientes, histórico e configuração)
│   │   ├── services/                # Regras de trilhas, mensagens e cronograma Setabot
│   │   ├── database.py              # Conexão com o SQLite
│   │   └── main.py                  # Rotas da API FastAPI
│   ├── scripts/
│   │   ├── extractDummyjson.py      # Extração paginada para data/raw/
│   │   └── popularBanco.py          # Consolidação no banco SQLite
│   ├── tests/test_api.py            # Testes da API com Pytest
│   └── requirements.txt
├── data/raw/                        # Arquivos JSON brutos por data e hora
├── frontend/src/                    # Aplicação React (views, components, services)
└── .env.example
```

## 💻 Como executar localmente

### 1. Clonar o repositório e criar o `.env`
```bash
git clone https://github.com/Tkailaine/bestlife.git
cd bestlife
cp .env.example .env   # No PowerShell: Copy-Item .env.example .env
```

### 2. Executar o Back-end (na raiz do projeto)
```bash
python -m venv venv
.\venv\Scripts\Activate.ps1          # Linux/macOS: source venv/bin/activate
pip install -r backend/requirements.txt

# Extrair dados da DummyJSON e popular o banco SQLite
python backend/scripts/extractDummyjson.py
python backend/scripts/popularBanco.py

# Iniciar a API (http://localhost:8000)
uvicorn app.main:app --reload --app-dir backend
```

### 3. Executar o Front-end (em outro terminal)
```bash
cd frontend
npm install
npm run dev                          # Abre em http://localhost:5173
```

### 4. Executar os testes
```bash
pytest backend/tests/test_api.py -v
```

## 📈 Possíveis evoluções

- Containerização com `Dockerfile` e `docker-compose`;
- Retentativa automática (*retry*) caso a API externa apresente instabilidade;
- Agendamento automático para disparo real integrado ao webhook da Setabot.
- Página de BI para estratégia de negócio conforme histórico de clientes.

## 👩‍💻 Autora

Thaissa Kailaine
