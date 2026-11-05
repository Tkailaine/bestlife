import { useState } from 'react';
import {
  BarChart3,
  Users,
  CalendarCheck2,
  MoreHorizontal,
  ArrowUpRight,
  Maximize2,
  Send,
} from 'lucide-react';
import type { Cliente, CronogramaItem, HistoricoSimulacao, TabType } from '../types';
import { ORDEM_TRILHAS, visualDaTrilha } from '../constants/trilhas';
import { formatarMoeda } from '../utils/format';
import { PageHeader, type Indicador } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { IconButton } from '../components/ui/IconButton';
import { AvatarStack } from '../components/ui/Avatar';
import { SendCalendar } from '../components/ui/SendCalendar';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { CustomerInspectorPanel } from '../components/ui/CustomerInspectorPanel';

interface DashboardViewProps {
  clientes: Cliente[];
  cronograma: CronogramaItem[];
  historico: HistoricoSimulacao[];
  clienteEmFoco: Cliente | null;
  onSelecionarClienteFoco: (cliente: Cliente) => void;
  onExpandirCliente: (cliente: Cliente) => void;
  onConfirmarTrilhas: (clienteId: number, trilhas: string[]) => Promise<void>;
  onNavigate: (tab: TabType, filtroTrilha?: string) => void;
  onQuickSimulate: () => void;
  isSimulating: boolean;
}

export function DashboardView({
  clientes,
  cronograma,
  historico,
  clienteEmFoco,
  onSelecionarClienteFoco,
  onExpandirCliente,
  onConfirmarTrilhas,
  onNavigate,
  onQuickSimulate,
  isSimulating,
}: DashboardViewProps) {
  const [modoFunil, setModoFunil] = useState<'sugeridas' | 'confirmadas'>('sugeridas');

  const totalClientes = clientes.length;
  const confirmados = clientes.filter((c) => c.status_confirmacao);
  const pendentes = totalClientes - confirmados.length;
  const volumeTotal = clientes.reduce((acc, c) => acc + c.valor_total_carrinhos, 0);

  // Agrupa clientes por trilha sugerida
  const clientesPorTrilha: Record<string, Cliente[]> = {
    'Alto valor': [],
    'Público jovem': [],
    'Compra em quantidade': [],
    Incentivo: [],
    Geral: [],
  };

  for (const c of clientes) {
    for (const t of c.trilhas_sugeridas) {
      if (clientesPorTrilha[t.nome]) {
        clientesPorTrilha[t.nome].push(c);
      }
    }
  }

  // Ordem visual do grid 2x3 inspirada nas 6 células de "Interaction History" da referência
  const ordemCardsGrid = [
    'Alto valor',
    'Público jovem',
    'Compra em quantidade',
    'Incentivo',
    'Geral',
  ] as const;

  const indicadoresTopo: Indicador[] = [
    {
      icon: BarChart3,
      valor: Math.round(volumeTotal),
      formato: (n) => formatarMoeda(n),
      chip: { texto: `${totalClientes} clientes`, tom: 'amarelo' },
      legenda: 'Volume acumulado dos carrinhos DummyJSON',
    },
    {
      icon: Users,
      valor: confirmados.length,
      formato: (n) => `+${n}`,
      chip: { texto: `${pendentes} pendentes`, tom: 'azul' },
      legenda: 'Clientes revisados e ativos no cronograma',
    },
    {
      icon: CalendarCheck2,
      valor: cronograma.length,
      formato: (n) => `+${n}`,
      chip: { texto: `${historico.length} simulados`, tom: 'vidro' },
      legenda: 'Disparos semanais previstos na fila Setabot',
    },
  ];

  // Navegação anterior / próximo no painel lateral direito
  const indiceAtual = clienteEmFoco
    ? clientes.findIndex((c) => c.id === clienteEmFoco.id)
    : 0;

  const irParaAnterior = () => {
    if (clientes.length === 0) return;
    const novoIndice = (indiceAtual - 1 + clientes.length) % clientes.length;
    onSelecionarClienteFoco(clientes[novoIndice]);
  };

  const irParaProximo = () => {
    if (clientes.length === 0) return;
    const novoIndice = (indiceAtual + 1) % clientes.length;
    onSelecionarClienteFoco(clientes[novoIndice]);
  };

  // Dados para o "Stage Funnel" (Funil em degraus como na referência Salesforce)
  const dadosFunil = ORDEM_TRILHAS.map((nome) => {
    const lista =
      modoFunil === 'sugeridas'
        ? clientesPorTrilha[nome] ?? []
        : clientes.filter((c) => c.status_confirmacao && c.trilhas_confirmadas.includes(nome));
    const somaValor = lista.reduce((acc, c) => acc + c.valor_total_carrinhos, 0);
    return {
      nome,
      quantidade: lista.length,
      valor: somaValor,
      primeiroCliente: lista[0] ?? null,
    };
  });

  return (
    <div>
      {/* Topo idêntico à anatomia "Customer Information" da referência */}
      <PageHeader
        linha1="Customer"
        linha2="Information"
        indicadores={indicadoresTopo}
        extra={
          <button
            type="button"
            onClick={onQuickSimulate}
            disabled={isSimulating || confirmados.length === 0}
            className="px-4 py-2.5 rounded-full bg-bl-ink text-white text-xs font-semibold shadow-lg hover:bg-bl-blue transition-all flex items-center gap-2 cursor-pointer disabled:opacity-45"
          >
            <Send className="w-3.5 h-3.5 text-bl-yellow" />
            {isSimulating ? 'Simulando lote...' : 'Simular envios de hoje'}
          </button>
        }
      />

      {/* Grade Bento Assimétrica de 12 Colunas (8 à esquerda + 4 à direita) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* COLUNA ESQUERDA (8 colunas): Trilhas de Comunicação + Calendário + Funil */}
        <div className="xl:col-span-8 flex flex-col gap-5">
          {/* BLOCO SUPERIOR: Grade 2x3 de Cards Coloridos & Translúcidos ("Interaction History") */}
          <Panel
            title="Trilhas de Comunicação & Carteira"
            subtitle="Clique em uma trilha para filtrar a carteira ou inspecionar seus clientes prioritários"
            delay={80}
            actions={
              <>
                <IconButton label="Ver todos os clientes" onClick={() => onNavigate('clientes')}>
                  <MoreHorizontal className="w-4 h-4" />
                </IconButton>
                <IconButton label="Abrir gestão de clientes" onClick={() => onNavigate('clientes')}>
                  <ArrowUpRight className="w-4 h-4" />
                </IconButton>
              </>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {ordemCardsGrid.map((nomeTrilha) => {
                const vis = visualDaTrilha(nomeTrilha);
                const lista = clientesPorTrilha[nomeTrilha] ?? [];
                const somaTrilha = lista.reduce((acc, c) => acc + c.valor_total_carrinhos, 0);
                const nomesAvatares = lista.slice(0, 4).map((c) => c.nome_completo);

                return (
                  <div
                    key={nomeTrilha}
                    onClick={() => {
                      if (lista[0]) onSelecionarClienteFoco(lista[0]);
                      onNavigate('clientes', nomeTrilha);
                    }}
                    className={`rounded-[24px] p-4 min-h-[152px] flex flex-col justify-between lift cursor-pointer ${vis.tile} ${vis.tileText}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-[11px] font-medium ${vis.tileSubtext}`}>
                          Prioridade 0{vis.prioridade} · {vis.regra}
                        </span>
                        <h4 className="font-semibold text-sm mt-1 leading-snug">
                          {nomeTrilha}
                        </h4>
                        <p className={`text-[11px] leading-tight mt-0.5 ${vis.tileSubtext}`}>
                          {vis.subtitulo}
                        </p>
                      </div>

                      {vis.destaqueSeta ? (
                        <span className="w-9 h-9 rounded-full bg-white text-bl-ink flex items-center justify-center shrink-0 shadow-md">
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-end justify-between gap-2 pt-4">
                      <div>
                        <div className="font-num-black text-lg leading-none">
                          {lista.length} clientes
                        </div>
                        <div className={`text-[10px] mt-1 ${vis.tileSubtext}`}>
                          {formatarMoeda(somaTrilha)}
                        </div>
                      </div>

                      {nomesAvatares.length > 0 && (
                        <AvatarStack nomes={nomesAvatares} max={3} />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* 6º Card da Grade 2x3: Lote Confirmado para Cronograma */}
              <div
                onClick={() => onNavigate('cronograma')}
                className="rounded-[24px] p-4 min-h-[152px] flex flex-col justify-between lift cursor-pointer bg-white/85 border border-white text-bl-ink shadow-[0_18px_34px_-22px_rgba(24,46,98,0.18)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-medium text-bl-muted">
                      Lote Ativo · 3 msgs/trilha
                    </span>
                    <h4 className="font-semibold text-sm mt-1 leading-snug">
                      Confirmados no Cronograma
                    </h4>
                    <p className="text-[11px] leading-tight mt-0.5 text-bl-muted">
                      Revisados pelo analista de CRM
                    </p>
                  </div>

                  <span className="glass-icon w-8 h-8 shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>

                <div className="flex items-end justify-between gap-2 pt-4">
                  <div>
                    <div className="font-num-black text-lg text-bl-blue leading-none">
                      {confirmados.length} aprovados
                    </div>
                    <div className="text-[10px] mt-1 text-bl-muted">
                      {cronograma.length} envios agendados
                    </div>
                  </div>

                  {confirmados.length > 0 && (
                    <AvatarStack
                      nomes={confirmados.slice(0, 4).map((c) => c.nome_completo)}
                      max={3}
                    />
                  )}
                </div>
              </div>
            </div>
          </Panel>

          {/* BLOCO INFERIOR DIVIDIDO: Calendário Semanal ("Tasks Schedule") + Funil em Degraus ("Stage Funnel") */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Calendário de Disparos (6 colunas) */}
            <Panel
              title="Agenda de Disparos"
              subtitle="Dias com envios previstos para clientes confirmados"
              className="lg:col-span-6"
              delay={160}
              actions={
                <>
                  <IconButton label="Opções do calendário" onClick={() => onNavigate('cronograma')}>
                    <MoreHorizontal className="w-4 h-4" />
                  </IconButton>
                  <IconButton label="Abrir cronograma completo" onClick={() => onNavigate('cronograma')}>
                    <ArrowUpRight className="w-4 h-4" />
                  </IconButton>
                </>
              }
            >
              <SendCalendar
                itens={cronograma}
                onSelecionarData={() => onNavigate('cronograma')}
                onExpandir={() => onNavigate('cronograma')}
              />
            </Panel>

            {/* Funil em Degraus Estilo "Stage Funnel" da Referência Salesforce (6 colunas) */}
            <Panel
              title="Funil por Prioridade"
              subtitle="Volume financeiro em cada etapa de trilha"
              className="lg:col-span-6"
              delay={220}
              actions={
                <>
                  <IconButton label="Filtrar trilhas" onClick={() => onNavigate('clientes')}>
                    <MoreHorizontal className="w-4 h-4" />
                  </IconButton>
                  <IconButton label="Ver clientes por trilha" onClick={() => onNavigate('clientes')}>
                    <ArrowUpRight className="w-4 h-4" />
                  </IconButton>
                </>
              }
            >
              <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                  <div className="font-num-black text-xl text-bl-ink">
                    {formatarMoeda(volumeTotal)}
                  </div>
                  <div className="text-[11px] text-bl-muted">Total em carteira</div>
                </div>

                <SegmentedControl<'sugeridas' | 'confirmadas'>
                  opcoes={[
                    { valor: 'sugeridas', rotulo: 'Sugeridas' },
                    { valor: 'confirmadas', rotulo: 'Confirmadas' },
                  ]}
                  valor={modoFunil}
                  onChange={setModoFunil}
                />
              </div>

              {/* Degraus escalonados (exatamente como o Stage Funnel da referência) */}
              <div className="space-y-2.5">
                {dadosFunil.slice(0, 4).map((etapa, idx) => {
                  const recuoLeft = idx * 18;
                  return (
                    <div
                      key={etapa.nome}
                      style={{ marginLeft: `${recuoLeft}px` }}
                      onClick={() => {
                        if (etapa.primeiroCliente) {
                          onSelecionarClienteFoco(etapa.primeiroCliente);
                        }
                        onNavigate('clientes', etapa.nome);
                      }}
                      className="glass-inset rounded-2xl px-4 py-3 flex items-center justify-between gap-3 lift cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] text-bl-muted truncate">
                          P{idx + 1} · {etapa.nome} ({etapa.quantidade} clientes)
                        </div>
                        <div className="font-num-black text-sm text-bl-ink mt-0.5">
                          {formatarMoeda(etapa.valor)}
                        </div>
                      </div>

                      <span className="glass-icon w-8 h-8 shrink-0">
                        <Maximize2 className="w-3.5 h-3.5 text-bl-muted" />
                      </span>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        </div>

        {/* COLUNA DIREITA (4 colunas): Perfil em Foco + "Detailed Information" (como Eva Robinson) */}
        <div className="xl:col-span-4">
          <CustomerInspectorPanel
            cliente={clienteEmFoco}
            onExpandirDetalhes={onExpandirCliente}
            onConfirmarTrilhas={onConfirmarTrilhas}
            onIrParaCronograma={() => onNavigate('cronograma')}
            onAnterior={irParaAnterior}
            onProximo={irParaProximo}
          />
        </div>
      </div>
    </div>
  );
}
