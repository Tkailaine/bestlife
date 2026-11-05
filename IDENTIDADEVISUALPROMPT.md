# Prompt para o Antigravity — CRM BestLife

## 1. Seu papel

Atue como um Senior Product Designer e Senior Front-end Developer, com experiência em interfaces SaaS, dashboards de CRM e sistemas de automação.

Quero que você desenvolva uma interface visualmente sofisticada, funcional e consistente, utilizando a identidade visual da BestLife e a referência de CRM que estou anexando.

Não quero apenas uma tela bonita. Quero um produto que pareça real, tenha boa usabilidade e demonstre capacidade de transformar um processo operacional em uma experiência digital eficiente.

Antes de começar, analise as duas imagens anexadas:

- **Imagem 1/siteBestLife:** site oficial da BestLife. Utilize como referência para a identidade visual, cores, tipografia e posicionamento da marca.
- **Imagem 2/referenciaCRM:** interface de CRM inspirada no Salesforce. Utilize como referência para a estrutura do dashboard, organização das informações, cards, navegação e densidade visual.

Não copie literalmente a segunda imagem. Reinterprete sua estrutura para criar um CRM próprio da BestLife.

## 2. Contexto do produto

Estou desenvolvendo um sistema que automatiza o envio de mensagens semanais para clientes de uma loja online, de acordo com seu perfil de compra.

Atualmente, esse processo é feito manualmente por meio de planilhas.

O sistema deverá permitir que um analista:

1. Visualize os clientes e seus dados de compra.
2. Identifique automaticamente as trilhas de comunicação recomendadas para cada cliente.
3. Entenda os motivos pelos quais cada cliente foi classificado em determinada trilha.
4. Confirme ou ajuste as trilhas sugeridas.
5. Consulte o cronograma de mensagens futuras.
6. Simule os envios de mensagens pelo WhatsApp.
7. Consulte o histórico das mensagens simuladas.

O objetivo é demonstrar como a BestLife poderia transformar um processo manual em uma operação organizada, rastreável e escalável.

## 3. Identidade visual da BestLife

A identidade visual deve ser aplicada em toda a interface.

### Paleta de cores

| Elemento | Cor |
|---|---|
| Azul institucional | `#264DA4` |
| Fundo principal | `#F3F3F3` |
| Cinza para containers e cards | `#E8E8E8` |
| Amarelo de destaque | `#F8BF29` |
| Texto principal | `#262626` |
| Texto secundário | `#737373` |
| Branco | `#FFFFFF` |

Observação: o amarelo `#F8BF29` é uma cor de destaque da identidade visual, não a cor padrão de todos os containers. Utilize-o pontualmente para indicadores, alertas, elementos selecionados e informações que precisam chamar atenção.

O azul institucional deve ser a principal cor de ação da interface.

### Tipografia

- **Mattone Semibold:** títulos, headings e elementos de destaque.
- **Helvetica Black:** identidade tipográfica predominante, especialmente em números, indicadores e elementos de marca.
- **Helvetica:** textos auxiliares, descrições, tabelas, formulários e informações operacionais.

Se as fontes não estiverem disponíveis no projeto, não invente uma substituição que descaracterize a marca. Verifique se os arquivos de fonte foram disponibilizados e, caso contrário, utilize uma alternativa visualmente próxima, mantendo uma hierarquia tipográfica consistente.

### Direção visual

A interface deve transmitir:

- Confiança e profissionalismo.
- Organização e clareza.
- Tecnologia aplicada ao negócio.
- Eficiência operacional.
- Uma identidade visual corporativa, mas não genérica.

Utilize o logo da BestLife que disponibilizei no projeto.

Não altere as proporções, cores ou características originais da marca.

Evite excesso de elementos decorativos, gradientes, sombras pesadas, bordas desnecessárias e efeitos visuais que prejudiquem a leitura.

## 4. Referência de interface

A segunda imagem é a principal referência estrutural.

Quero uma interface que tenha:

- Sidebar vertical com navegação.
- Barra superior com identificação da página e ações rápidas.
- Dashboard com cards de indicadores.
- Área principal organizada em containers.
- Informações distribuídas em blocos visuais.
- Tabelas e listas com boa densidade de informação.
- Cards com bordas suaves e espaçamento consistente.
- Uma área de detalhes do cliente, semelhante ao painel lateral de informações do Salesforce.
- A interface deve ser responsiva para diferentes dispositivos

A referência possui uma estética de CRM moderno, com grandes áreas de informação, cards organizados e navegação compacta.

Quero preservar essa lógica, mas adaptá-la para a BestLife.

A interface não deve parecer um site institucional ou uma landing page. Ela deve parecer um sistema interno utilizado diariamente por uma equipe de marketing, CRM ou operações.

## 5. Estrutura da aplicação

Crie uma aplicação com as seguintes páginas:

### 5.1. Dashboard

Esta será a página inicial do sistema.

O dashboard deve apresentar uma visão geral da operação de comunicação com clientes.

Indicadores sugeridos:

- Total de clientes cadastrados.
- Clientes aguardando aprovação.
- Clientes confirmados.
- Mensagens previstas para hoje.
- Mensagens simuladas.
- Clientes classificados por trilha.

Organize os indicadores em cards compactos e visualmente consistentes.

Abaixo dos indicadores, crie uma área com:

- Distribuição de clientes por trilha.
- Próximos envios programados.
- Atividades recentes.
- Um resumo da operação.

Utilize gráficos apenas quando ajudarem a compreender os dados.

Não invente números para preencher o dashboard. Quando os dados reais ainda não estiverem disponíveis, utilize estados vazios bem projetados ou dados de demonstração claramente identificados.

### 5.2. Clientes

Crie uma página de gerenciamento de clientes.

A estrutura deve conter:

- Título da página.
- Indicadores compactos.
- Campo de busca.
- Filtros por trilha.
- Filtros por status de aprovação.
- Tabela de clientes.

A tabela deve exibir:

| Coluna | Informação |
|---|---|
| Cliente | Nome completo |
| Idade | Idade do cliente |
| Estado | UF |
| Valor total | Valor total dos carrinhos |
| Itens | Quantidade total de itens |
| Trilhas | Trilhas recomendadas |
| Status | Pendente, confirmado ou ajustado |

Utilize badges discretos para identificar as trilhas.

A tabela deve permitir que o analista identifique rapidamente quais clientes precisam de atenção.

Ao clicar em um cliente, deve ser possível acessar sua página de detalhes.

### 5.3. Detalhes do cliente

Esta página deve seguir a lógica de um CRM profissional.

Organize as informações em blocos:

**Perfil do cliente**

- Nome completo.
- Idade.
- Sexo.
- Estado.
- Telefone.

**Resumo de compras**

- Valor total dos carrinhos.
- Quantidade total de itens.
- Indicadores relevantes para a classificação.

**Trilhas recomendadas**

Para cada trilha, exiba:

- Nome da trilha.
- Prioridade.
- Regra que justificou a classificação.
- Motivo detalhado.

Exemplo:

Trilha: Alto valor

Regra: Valor total ≥ R$ 10.000.

Motivo: Valor total de compras de R$ 12.450,00, acima do limite de R$ 10.000,00.

O motivo deve ser compreensível para uma pessoa que não conhece o código.

**Ações do analista**

O analista deve conseguir:

- Confirmar as trilhas sugeridas.
- Ajustar as trilhas manualmente.
- Salvar sua decisão.

A interface deve deixar claro que somente clientes confirmados entram no cronograma de mensagens.

### 5.4. Cronograma

Crie uma página para visualizar os envios programados.

Utilize uma estrutura de calendário ou timeline semanal, com boa hierarquia visual.

Cada item deve exibir:

- Nome do cliente.
- Trilha.
- Número da mensagem na sequência.
- Data prevista.
- Status do envio.

A operação deve respeitar as seguintes regras:

- Cada trilha possui três mensagens.
- As mensagens são enviadas uma vez por semana.
- O dia da semana deve ser configurável.
- Cada cliente percorre uma trilha por vez.
- A próxima trilha só começa após a conclusão das três mensagens da anterior.
- As trilhas seguem a ordem de prioridade definida no case.

O cronograma deve permitir visualizar facilmente os próximos envios.

### 5.5. Histórico de envios

Crie uma página para consultar as mensagens simuladas.

Exiba:

- Cliente.
- Trilha.
- Mensagem.
- Data prevista.
- Status.
- Requisição que seria enviada à plataforma de WhatsApp.

O histórico deve ser organizado e permitir que o analista compreenda o que aconteceu com cada mensagem.

Inclua um botão de ação chamado **Simular envios de hoje**.

O botão deve executar a simulação prevista pelo backend, sem realizar chamadas reais à API do WhatsApp.

## 6. Classificação dos clientes

As trilhas de comunicação são:

| Prioridade | Trilha | Regra |
|---|---|---|
| 1 | Alto valor | Valor total ≥ R$ 10.000 |
| 2 | Compra em quantidade | Quantidade de itens ≥ 15 |
| 3 | Incentivo | Valor total < R$ 1.000 |
| 4 | Público jovem | Idade < 30 |
| 5 | Geral | Não se encaixou em nenhuma das anteriores |

Um cliente pode participar de mais de uma trilha.

A interface deve apresentar as trilhas de maneira visualmente clara, sem confundir classificação automática com decisão do analista.

Utilize uma hierarquia visual que permita identificar a prioridade de cada trilha.

## 7. Componentes e experiência do usuário

Crie componentes reutilizáveis para:

- Sidebar.
- Header.
- Cards de indicadores.
- Tabela de clientes.
- Badges de trilhas.
- Status de aprovação.
- Filtros.
- Campo de busca.
- Painel de detalhes.
- Timeline.
- Calendário.
- Modais de confirmação.
- Estados vazios.
- Alertas e notificações.

Todos os componentes devem seguir o mesmo sistema visual.

Utilize espaçamentos consistentes, alinhamento cuidadoso e uma hierarquia tipográfica clara.

A interface deve funcionar bem em desktop e ser responsiva para telas menores.

Priorize a experiência desktop, pois o sistema será utilizado principalmente por analistas em ambiente de trabalho.

## 8. Diretrizes técnicas

Antes de implementar a interface:

1. Analise a estrutura atual do projeto.
2. Identifique as tecnologias utilizadas.
3. Verifique quais componentes já existem.
4. Preserve funcionalidades já implementadas.
5. Não reescreva o projeto inteiro sem necessidade.
6. Não altere a lógica que já foi implementada no backend e integrações.
7. Somente altere o front-end e faça a comunicação com o backend para que funcione as funcionalidades na interface.

Utilize os dados reais da aplicação sempre que disponíveis.

Não crie dados fictícios apenas para tornar a interface visualmente mais preenchida.

Caso alguma funcionalidade ainda não esteja implementada no backend, construa a interface com estados vazios e deixe claro o que está pendente.

A interface deve ser funcional, e não apenas uma representação estática.

Não implemente chamadas reais de WhatsApp.

Não exponha tokens, credenciais ou variáveis de ambiente no frontend.

## 9. Processo de desenvolvimento

Quero que você trabalhe como um desenvolvedor sênior me orientando.

Antes de iniciar, apresente uma proposta de estrutura visual com:

- Organização das páginas.
- Componentes principais.
- Hierarquia de informações.
- Aplicação da identidade visual.
- Estratégia de implementação.

Explique brevemente as decisões de design e como elas contribuem para a experiência do usuário.

Depois, implemente a interface de forma incremental.

Priorize primeiro a estrutura visual e a consistência do design system. Em seguida, conecte os componentes aos dados e às funcionalidades existentes.

Não altere regras de negócio para facilitar a implementação visual.

Ao finalizar, revise a aplicação considerando:

- Fidelidade à identidade visual da BestLife.
- Proximidade estrutural com a referência de CRM.
- Clareza das informações.
- Consistência dos componentes.
- Responsividade.
- Funcionalidade dos botões e filtros.
- Ausência de dados fictícios não identificados.
- Qualidade visual geral.

## 10. Resultado esperado

Quero uma interface que pareça um CRM corporativo desenvolvido especificamente para a BestLife.

O resultado deve combinar a identidade visual institucional da marca com a organização e a densidade visual de um sistema moderno de CRM.

A referência do Salesforce deve orientar a estrutura e a experiência, mas o produto final deve ter identidade própria.

Priorize um design elegante, funcional, consistente e profissional.

O objetivo é que, ao apresentar o case, a interface demonstre não apenas conhecimento técnico, mas também entendimento de produto, experiência do usuário e visão de negócio.