import { useState } from 'react';
import {
  BarChart3,
  Users,
  CalendarCheck2,
  MoreHorizontal,
  ArrowUpRight,
  Check,
  Send,
  Sparkles,
} from 'lucide-react';
import type { Cliente, CronogramaItem, HistoricoSimulacao, TabType } from '../types';
import { visualDaTrilha } from '../constants/trilhas';
import { formatarMoeda } from '../utils/format';
import { calcularInteligenciaOperacao } from '../utils/intelligence';
import { PageHeader, type Indicador } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { IconButton } from '../components/ui/IconButton';
import { Avatar, AvatarStack } from '../components/ui/Avatar';
import { SendCalendar } from '../components/ui/SendCalendar';
import { CustomerInspectorPanel } from '../components/ui/CustomerInspectorPanel';

interface DashboardViewProps {
  clientes: Cliente[];
  cronograma: CronogramaItem[];
  historico: HistoricoSimulacao[];
  clienteEmFoco: Cliente | null;
  onSelecionarClienteFoco: (cliente: Cliente) => void;
  onExpandirCliente: (cliente: Cliente) => void;
  onConfirmarTrilhas: (
    clienteId: number,
    trilhas: string[],
    diaSemanaEnvio?: number | null
  ) => Promise<void>;
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
  const [aprovandoId, setAprovandoId] = useState<number | null>(null);

  const totalClientes = clientes.length;
  const confirmados = clientes.filter((c) => c.status_confirmacao);
  const pendentes = totalClientes - confirmados.length;
  const volumeTotal = clientes.reduce((acc, c) => acc + c.valor_total_carrinhos, 0);

  const inteligencia = calcularInteligenciaOperacao(clientes);

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
      legenda: 'Volume acumulado em carrinhos na base',
    },
    {
      icon: Users,
      valor: confirmados.length,
      formato: (n) => `+${n}`,
      chip: { texto: `${pendentes} pendentes`, tom: 'azul' },
      legenda: 'Clientes aprovados pelo analista de CRM',
    },
    {
      icon: CalendarCheck2,
      valor: cronograma.length,
      formato: (n) => `+${n}`,
      chip: { texto: `${historico.length} simulados`, tom: 'vidro' },
      legenda: 'Mensagens previstas nas próximas semanas',
    },
  ];

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

  const aprovarRapido = async (c: Cliente) => {
    setAprovandoId(c.id);
    try {
      const sugeridas = c.trilhas_sugeridas.map((t) => t.nome);
      await onConfirmarTrilhas(c.id, sugeridas);
    } finally {
      setAprovandoId(null);
    }
  };

  return (
    <div className="space-y-7">
      {/* Cabeçalho amplo e arejado */}
      <PageHeader
        linha1="Visão Geral"
        linha2="da Operação CRM"
        indicadores={indicadoresTopo}
        extra={
          <button
            type="button"
            onClick={onQuickSimulate}
            disabled={isSimulating || confirmados.length === 0}
            className="px-5 py-3 rounded-full bg-bl-ink text-white text-xs font-bold shadow-lg hover:bg-bl-blue transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-45"
          >
            <Send className="w-4 h-4 text-bl-yellow" />
            {isSimulating ? 'Simulando lote...' : 'Simular envios de hoje'}
          </button>
        }
      />

      {/* Grade Bento Espaçosa (8 colunas à esquerda + 4 à direita) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
        {/* COLUNA ESQUERDA (8 colunas) */}
        <div className="xl:col-span-8 flex flex-col gap-7">
          {/* BLOCO 1: Grade 2x3 de Trilhas (Limpa, com bastante espaço interno) */}
          <Panel
            title="Distribuição por Trilhas de Comunicação"
            subtitle="Clique em uma trilha para filtrar os clientes ou selecionar o perfil em destaque"
            delay={70}
            actions={
              <IconButton
                label="Abrir carteira completa de clientes"
                onClick={() => onNavigate('clientes')}
              >
                <ArrowUpRight className="w-4 h-4" />
              </IconButton>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ordemCardsGrid.map((nomeTrilha) => {
                const vis = visualDaTrilha(nomeTrilha);
                const lista = clientesPorTrilha[nomeTrilha] ?? [];
                const nomesAvatares = lista.slice(0, 4).map((c) => c.nome_completo);

                return (
                  <div
                    key={nomeTrilha}
                    onClick={() => {
                      if (lista[0]) onSelecionarClienteFoco(lista[0]);
                      onNavigate('clientes', nomeTrilha);
                    }}
                    className={`rounded-[26px] p-5 min-h-[158px] flex flex-col justify-between lift cursor-pointer ${vis.tile} ${vis.tileText}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-xs font-medium ${vis.tileSubtext}`}>
                          Prioridade 0{vis.prioridade}
                        </span>
                        <h4 className="font-bold text-base mt-1 leading-snug">
                          {nomeTrilha}
                        </h4>
                        <p className={`text-xs mt-0.5 ${vis.tileSubtext}`}>
                          {vis.regra}
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

                    <div className="flex items-end justify-between gap-2 pt-5">
                      <span className="font-num-black text-xl leading-none">
                        {lista.length}
                      </span>

                      {nomesAvatares.length > 0 && (
                        <AvatarStack nomes={nomesAvatares} max={3} />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* 6º Card: Lote Confirmado */}
              <div
                onClick={() => onNavigate('cronograma')}
                className="rounded-[26px] p-5 min-h-[158px] flex flex-col justify-between lift cursor-pointer bg-white/85 border border-white text-bl-ink shadow-[0_18px_34px_-22px_rgba(24,46,98,0.16)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-bl-muted">
                      Cronograma Ativo
                    </span>
                    <h4 className="font-bold text-base mt-1 leading-snug">
                      Clientes Confirmados
                    </h4>
                    <p className="text-xs mt-0.5 text-bl-muted">
                      {cronograma.length} mensagens na fila
                    </p>
                  </div>

                  <span className="glass-icon w-8 h-8 shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>

                <div className="flex items-end justify-between gap-2 pt-5">
                  <span className="font-num-black text-xl text-bl-blue leading-none">
                    {confirmados.length}
                  </span>

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

          {/* BLOCO 2: Calendário Semanal + Fila Inteligente de Maior Impacto */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* Calendário de Disparos (6 colunas) */}
            <Panel
              title="Calendário de Disparos"
              subtitle="Visão mensal das próximas semanas programadas"
              className="lg:col-span-6"
              delay={140}
              actions={
                <IconButton
                  label="Abrir cronograma detalhado"
                  onClick={() => onNavigate('cronograma')}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </IconButton>
              }
            >
              <SendCalendar
                itens={cronograma}
                onSelecionarData={() => onNavigate('cronograma')}
              />
            </Panel>

            {/* Fila Inteligente de Decisão (6 colunas — apoia o analista no que aprovar primeiro) */}
            <Panel
              title="Foco do Analista · Maior Impacto"
              subtitle="Clientes pendentes com maior valor em compras aguardando liberação"
              className="lg:col-span-6"
              delay={200}
              actions={
                <IconButton
                  label="Ver todos os pendentes"
                  onClick={() => onNavigate('clientes')}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </IconButton>
              }
            >
              {/* Resumo de valor represado */}
              <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-white/60">
                <div>
                  <div className="text-xs text-bl-muted">
                    Potencial aguardando confirmação ({inteligencia.vipPendentes.length} VIPs)
                  </div>
                  <div className="font-num-black text-xl text-bl-ink mt-0.5">
                    {formatarMoeda(inteligencia.valorRetidoPendentes)}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-bl-yellow px-3 py-1 text-xs font-bold text-bl-ink">
                  <Sparkles className="w-3.5 h-3.5" />
                  Priorizar hoje
                </span>
              </div>

              {/* Lista escalonada em degraus (inspirada no Stage Funnel, mas focada em decisão) */}
              <div className="space-y-3">
                {inteligencia.filaMaiorImpacto.slice(0, 4).map((c, idx) => {
                  const recuo = idx * 12;
                  const selecionado = clienteEmFoco?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      style={{ marginLeft: `${recuo}px` }}
                      onClick={() => onSelecionarClienteFoco(c)}
                      className={`rounded-2xl px-4 py-3 flex items-center justify-between gap-3 lift cursor-pointer ${
                        selecionado
                          ? 'bg-white/95 ring-1 ring-bl-blue/40 shadow-md'
                          : 'glass-inset'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar nome={c.nome_completo} size="md" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-bl-ink truncate">
                            {c.nome_completo}
                          </div>
                          <div className="text-[11px] text-bl-muted truncate">
                            {formatarMoeda(c.valor_total_carrinhos)} •{' '}
                            {c.trilhas_sugeridas.map((t) => t.nome).join(', ')}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={aprovandoId === c.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          aprovarRapido(c);
                        }}
                        title="Aprovar recomendação com 1 clique"
                        className="glass-icon w-8 h-8 shrink-0 hover:bg-bl-blue hover:text-white"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        </div>

        {/* COLUNA DIREITA (4 colunas): Cliente em Foco + Diagnóstico Executivo */}
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
