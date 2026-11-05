import { useState, useEffect, type RefObject } from 'react';
import {
  Search,
  Users,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  SlidersHorizontal,
  X,
  Sparkles,
  Check,
  ArrowUpDown,
} from 'lucide-react';
import type { Cliente } from '../types';
import { ORDEM_TRILHAS, visualDaTrilha } from '../constants/trilhas';
import { formatarMoeda, statusDoCliente } from '../utils/format';
import { diagnosticarCliente } from '../utils/intelligence';
import { PageHeader, type Indicador } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { Avatar } from '../components/ui/Avatar';
import { TrilhaBadge, StatusBadge } from '../components/ui/Badges';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { CustomerInspectorPanel } from '../components/ui/CustomerInspectorPanel';
import { EmptyState } from '../components/ui/EmptyState';

interface ClientesViewProps {
  clientes: Cliente[];
  isLoading: boolean;
  filtroTrilhaInicial?: string;
  clienteEmFoco: Cliente | null;
  onSelecionarClienteFoco: (cliente: Cliente) => void;
  onExpandirCliente: (cliente: Cliente) => void;
  onConfirmarTrilhas: (
    clienteId: number,
    trilhas: string[],
    diaSemanaEnvio?: number | null
  ) => Promise<void>;
  onVoltarDashboard: () => void;
  buscaInputRef?: RefObject<HTMLInputElement | null>;
}

const OPCOES_TRILHA = ['Todas', ...ORDEM_TRILHAS];
type OrdemClientes = 'impacto' | 'pendentes' | 'id';

export function ClientesView({
  clientes,
  isLoading,
  filtroTrilhaInicial = 'Todas',
  clienteEmFoco,
  onSelecionarClienteFoco,
  onExpandirCliente,
  onConfirmarTrilhas,
  onVoltarDashboard,
  buscaInputRef,
}: ClientesViewProps) {
  const [busca, setBusca] = useState('');
  const [filtroTrilha, setFiltroTrilha] = useState(filtroTrilhaInicial);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendentes' | 'confirmados'>('todos');
  const [ordenacao, setOrdenacao] = useState<OrdemClientes>('impacto');
  const [aprovandoId, setAprovandoId] = useState<number | null>(null);

  useEffect(() => {
    setFiltroTrilha(filtroTrilhaInicial);
  }, [filtroTrilhaInicial]);

  const total = clientes.length;
  const confirmados = clientes.filter((c) => c.status_confirmacao).length;
  const pendentes = total - confirmados;

  const clientesFiltrados = clientes
    .filter((c) => {
      const termo = busca.trim().toLowerCase();
      const atendeBusca =
        !termo ||
        c.nome_completo.toLowerCase().includes(termo) ||
        (c.estado && c.estado.toLowerCase().includes(termo)) ||
        c.telefone.includes(termo);

      const trilhasCliente = c.trilhas_sugeridas.map((t) => t.nome);
      const atendeTrilha =
        filtroTrilha === 'Todas' || trilhasCliente.includes(filtroTrilha);

      const atendeStatus =
        filtroStatus === 'todos' ||
        (filtroStatus === 'confirmados' && c.status_confirmacao) ||
        (filtroStatus === 'pendentes' && !c.status_confirmacao);

      return atendeBusca && atendeTrilha && atendeStatus;
    })
    .sort((a, b) => {
      if (ordenacao === 'impacto') {
        return b.valor_total_carrinhos - a.valor_total_carrinhos;
      }
      if (ordenacao === 'pendentes') {
        if (a.status_confirmacao !== b.status_confirmacao) {
          return a.status_confirmacao ? 1 : -1;
        }
        return b.valor_total_carrinhos - a.valor_total_carrinhos;
      }
      return a.id - b.id;
    });

  const handleAprovarRapido = async (e: React.MouseEvent, c: Cliente) => {
    e.stopPropagation();
    setAprovandoId(c.id);
    try {
      await onConfirmarTrilhas(
        c.id,
        c.trilhas_sugeridas.map((t) => t.nome)
      );
    } finally {
      setAprovandoId(null);
    }
  };

  const indicadores: Indicador[] = [
    {
      icon: Users,
      valor: total,
      chip: { texto: `${clientesFiltrados.length} visíveis`, tom: 'vidro' },
      legenda: 'Clientes consolidados na base',
    },
    {
      icon: Clock,
      valor: pendentes,
      chip: { texto: 'Requer revisão', tom: 'amarelo' },
      legenda: 'Aguardando aprovação do analista',
    },
    {
      icon: CheckCircle2,
      valor: confirmados,
      formato: (n) => `${n}`,
      chip: {
        texto: `${total > 0 ? Math.round((confirmados / total) * 100) : 0}% da carteira`,
        tom: 'azul',
      },
      legenda: 'Já inseridos no cronograma semanal',
    },
  ];

  const indiceFoco = clienteEmFoco
    ? clientesFiltrados.findIndex((c) => c.id === clienteEmFoco.id)
    : 0;

  return (
    <div>
      <PageHeader
        linha1="Carteira de"
        linha2="Clientes & Decisão"
        indicadores={indicadores}
        onVoltar={onVoltarDashboard}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
        {/* COLUNA ESQUERDA (8 colunas): Filtros + Tabela limpa e respirável */}
        <div className="xl:col-span-8 flex flex-col gap-7">
          {/* Painel de Busca, Filtro de Status e Ordenação Inteligente */}
          <Panel delay={60}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Campo de busca translúcido */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-bl-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  ref={buscaInputRef}
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome, estado (UF) ou telefone..."
                  className="w-full pl-11 pr-9 py-3 rounded-full glass-well text-xs text-bl-ink placeholder:text-bl-muted focus:bg-white/90 focus:outline-none focus:ring-2 focus:ring-bl-blue/35 transition-all"
                />
                {busca && (
                  <button
                    type="button"
                    onClick={() => setBusca('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-bl-muted hover:text-bl-ink cursor-pointer"
                    aria-label="Limpar busca"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filtro segmentado por Status */}
              <SegmentedControl<'todos' | 'pendentes' | 'confirmados'>
                opcoes={[
                  { valor: 'todos', rotulo: 'Todos', contagem: total },
                  { valor: 'pendentes', rotulo: 'Pendentes', contagem: pendentes },
                  { valor: 'confirmados', rotulo: 'Confirmados', contagem: confirmados },
                ]}
                valor={filtroStatus}
                onChange={setFiltroStatus}
              />
            </div>

            {/* Pílulas de filtro por Trilha + Ordenação de Negócio */}
            <div className="flex items-center justify-between gap-3 flex-wrap mt-5 pt-4 border-t border-white/70">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-bl-muted flex items-center gap-1.5 mr-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-bl-blue" />
                  Trilha:
                </span>
                {OPCOES_TRILHA.map((trilha) => {
                  const ativa = filtroTrilha === trilha;
                  const vis = trilha !== 'Todas' ? visualDaTrilha(trilha) : null;
                  return (
                    <button
                      key={trilha}
                      type="button"
                      onClick={() => setFiltroTrilha(trilha)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        ativa
                          ? 'bg-bl-ink text-white shadow-sm'
                          : 'glass-inset text-bl-ink/80 hover:bg-white/85'
                      }`}
                    >
                      {vis && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: ativa ? '#F8BF29' : vis.dot }}
                        />
                      )}
                      {trilha}
                    </button>
                  );
                })}
              </div>

              {/* Seletor de Priorização para tomada de decisão */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-bl-blue" />
                <span className="text-[11px] text-bl-muted font-medium">Ordenar:</span>
                {(
                  [
                    { id: 'impacto', label: 'Maior Valor' },
                    { id: 'pendentes', label: 'Pendentes 1º' },
                    { id: 'id', label: 'Padrão' },
                  ] as const
                ).map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setOrdenacao(op.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      ordenacao === op.id
                        ? 'bg-bl-blue/15 text-bl-blue'
                        : 'text-bl-muted hover:text-bl-ink'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          {/* Tabela CRM mais limpa e espaçosa */}
          <Panel
            title="Base Consolidada de Clientes"
            subtitle="Ordenada para destacar clientes de maior impacto financeiro. Clique em uma linha para ver o diagnóstico ao lado."
            delay={120}
          >
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 skeleton" />
                ))}
              </div>
            ) : clientesFiltrados.length === 0 ? (
              <EmptyState
                icon={Users}
                titulo="Nenhum cliente encontrado"
                texto="Ajuste os filtros de trilha, status ou termo de busca para visualizar os registros."
              />
            ) : (
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-left border-separate border-spacing-y-2.5 text-xs">
                  <thead>
                    <tr className="text-[11px] font-semibold uppercase tracking-wider text-bl-muted">
                      <th className="pb-2 pl-4">Cliente & Perfil</th>
                      <th className="pb-2 px-3">Receita & Volume</th>
                      <th className="pb-2 px-3">Trilhas & Diagnóstico</th>
                      <th className="pb-2 px-3">Status</th>
                      <th className="pb-2 pr-4 text-right">Decisão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.map((c) => {
                      const selecionado = clienteEmFoco?.id === c.id;
                      const status = statusDoCliente(c);
                      const diag = diagnosticarCliente(c);

                      return (
                        <tr
                          key={c.id}
                          onClick={() => onSelecionarClienteFoco(c)}
                          className={`transition-all cursor-pointer ${
                            selecionado
                              ? 'bg-white/95 shadow-md ring-1 ring-bl-blue/40'
                              : 'glass-inset hover:bg-white/80'
                          }`}
                        >
                          {/* Cliente + Idade + Estado */}
                          <td className="py-3.5 pl-4 pr-3 rounded-l-2xl">
                            <div className="flex items-center gap-3">
                              <Avatar nome={c.nome_completo} size="md" />
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-bl-ink truncate">
                                  {c.nome_completo}
                                </div>
                                <div className="text-[11px] text-bl-muted mt-0.5">
                                  {c.idade} anos • {c.estado || '—'} •{' '}
                                  <span className="font-mono">{c.telefone}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Valor Total + Quantidade de Itens */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="font-num-black text-sm text-bl-ink">
                              {formatarMoeda(c.valor_total_carrinhos)}
                            </div>
                            <div className="text-[11px] text-bl-muted mt-0.5">
                              {c.quantidade_total_itens} itens acumulados
                            </div>
                          </td>

                          {/* Trilhas + Tag de Diagnóstico Inteligente */}
                          <td className="py-3.5 px-3">
                            <div className="flex flex-wrap gap-1.5 max-w-[260px]">
                              {c.trilhas_sugeridas.map((t) => (
                                <TrilhaBadge
                                  key={t.nome}
                                  nome={t.nome}
                                  confirmada={
                                    c.status_confirmacao &&
                                    c.trilhas_confirmadas.includes(t.nome)
                                  }
                                />
                              ))}
                            </div>
                            {diag.tom !== 'estavel' && (
                              <div className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-amber-800">
                                <Sparkles className="w-3 h-3 text-amber-600" />
                                {diag.selo}
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <StatusBadge status={status} />
                          </td>

                          {/* Ações Rápidas (Aprovar em 1 clique + Abrir gaveta) */}
                          <td className="py-3.5 pr-4 pl-2 rounded-r-2xl text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {!c.status_confirmacao && (
                                <button
                                  type="button"
                                  disabled={aprovandoId === c.id}
                                  onClick={(e) => handleAprovarRapido(e, c)}
                                  className="px-3 py-1.5 rounded-full bg-bl-blue hover:bg-bl-blue-deep text-white text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                                  title="Confirmar trilhas sugeridas em 1 clique"
                                >
                                  <Check className="w-3 h-3 text-bl-yellow" />
                                  {aprovandoId === c.id ? '...' : 'Aprovar'}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onExpandirCliente(c);
                                }}
                                className="glass-icon w-8 h-8"
                                title="Abrir ficha completa"
                                aria-label="Abrir ficha completa"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        {/* COLUNA DIREITA (4 colunas): Painel Lateral de Inspeção & Diagnóstico */}
        <div className="xl:col-span-4 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:pr-1 pb-4">
          <CustomerInspectorPanel
            cliente={clienteEmFoco}
            onExpandirDetalhes={onExpandirCliente}
            onConfirmarTrilhas={onConfirmarTrilhas}
            onAnterior={() => {
              if (clientesFiltrados.length === 0) return;
              const idx =
                (indiceFoco - 1 + clientesFiltrados.length) %
                clientesFiltrados.length;
              onSelecionarClienteFoco(clientesFiltrados[idx]);
            }}
            onProximo={() => {
              if (clientesFiltrados.length === 0) return;
              const idx = (indiceFoco + 1) % clientesFiltrados.length;
              onSelecionarClienteFoco(clientesFiltrados[idx]);
            }}
          />
        </div>
      </div>
    </div>
  );
}
