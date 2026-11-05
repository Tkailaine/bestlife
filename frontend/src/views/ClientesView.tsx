import { useState, useEffect, type RefObject } from 'react';
import {
  Search,
  Users,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { Cliente } from '../types';
import { ORDEM_TRILHAS, visualDaTrilha } from '../constants/trilhas';
import { formatarMoeda, statusDoCliente } from '../utils/format';
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
  onConfirmarTrilhas: (clienteId: number, trilhas: string[]) => Promise<void>;
  onVoltarDashboard: () => void;
  buscaInputRef?: RefObject<HTMLInputElement | null>;
}

const OPCOES_TRILHA = ['Todas', ...ORDEM_TRILHAS];

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

  useEffect(() => {
    setFiltroTrilha(filtroTrilhaInicial);
  }, [filtroTrilhaInicial]);

  const total = clientes.length;
  const confirmados = clientes.filter((c) => c.status_confirmacao).length;
  const pendentes = total - confirmados;

  const clientesFiltrados = clientes.filter((c) => {
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
  });

  const indicadores: Indicador[] = [
    {
      icon: Users,
      valor: total,
      chip: { texto: `${clientesFiltrados.length} visíveis`, tom: 'vidro' },
      legenda: 'Clientes consolidados no banco SQLite',
    },
    {
      icon: Clock,
      valor: pendentes,
      chip: { texto: 'Requer revisão', tom: 'amarelo' },
      legenda: 'Clientes aguardando decisão do analista',
    },
    {
      icon: CheckCircle2,
      valor: confirmados,
      formato: (n) => `+${n}`,
      chip: {
        texto: `${total > 0 ? Math.round((confirmados / total) * 100) : 0}% da base`,
        tom: 'azul',
      },
      legenda: 'Confirmados e inseridos no cronograma',
    },
  ];

  const indiceFoco = clienteEmFoco
    ? clientesFiltrados.findIndex((c) => c.id === clienteEmFoco.id)
    : 0;

  return (
    <div>
      <PageHeader
        linha1="Carteira de"
        linha2="Clientes & Trilhas"
        indicadores={indicadores}
        onVoltar={onVoltarDashboard}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* COLUNA ESQUERDA (8 colunas): Filtros + Tabela Densa de Clientes */}
        <div className="xl:col-span-8 flex flex-col gap-5">
          {/* Painel de Busca e Filtros em Vidro Fosco */}
          <Panel delay={60}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Campo de busca translúcido */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-bl-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={buscaInputRef}
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome, estado (UF) ou telefone..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-full glass-well text-xs text-bl-ink placeholder:text-bl-muted focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-bl-blue/35 transition-all"
                />
                {busca && (
                  <button
                    type="button"
                    onClick={() => setBusca('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-bl-muted hover:text-bl-ink cursor-pointer"
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

            {/* Pílulas de filtro por Trilha */}
            <div className="flex items-center gap-1.5 flex-wrap mt-3.5 pt-3.5 border-t border-white/60">
              <span className="text-[11px] font-semibold text-bl-muted flex items-center gap-1 mr-1">
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
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      ativa
                        ? 'bg-bl-ink text-white shadow-sm'
                        : 'glass-inset text-bl-ink/80 hover:bg-white/80'
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
          </Panel>

          {/* Tabela CRM com alta densidade de informação */}
          <Panel
            title="Base Consolidada de Clientes"
            subtitle="Clique em qualquer linha para inspecionar motivos à direita ou expandir a ficha completa"
            delay={120}
          >
            {isLoading ? (
              <div className="space-y-2.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-14 skeleton" />
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
                <table className="w-full text-left border-separate border-spacing-y-1.5 text-xs">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-wider text-bl-muted">
                      <th className="pb-2 pl-3">Cliente</th>
                      <th className="pb-2 px-2">Idade</th>
                      <th className="pb-2 px-2">Estado</th>
                      <th className="pb-2 px-2">Valor Total</th>
                      <th className="pb-2 px-2">Itens</th>
                      <th className="pb-2 px-2">Trilhas Recomendadas</th>
                      <th className="pb-2 px-2">Status</th>
                      <th className="pb-2 pr-3 text-right">Ficha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.map((c) => {
                      const selecionado = clienteEmFoco?.id === c.id;
                      const status = statusDoCliente(c);
                      return (
                        <tr
                          key={c.id}
                          onClick={() => onSelecionarClienteFoco(c)}
                          className={`transition-all cursor-pointer ${
                            selecionado
                              ? 'bg-white/90 shadow-md ring-1 ring-bl-blue/40'
                              : 'glass-inset hover:bg-white/75'
                          }`}
                        >
                          <td className="py-2.5 pl-3 pr-2 rounded-l-2xl">
                            <div className="flex items-center gap-2.5">
                              <Avatar nome={c.nome_completo} size="md" />
                              <div className="min-w-0">
                                <div className="font-bold text-bl-ink truncate">
                                  {c.nome_completo}
                                </div>
                                <div className="text-[10px] text-bl-muted font-mono">
                                  {c.telefone}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-2.5 px-2 font-medium text-bl-ink whitespace-nowrap">
                            {c.idade}a
                          </td>

                          <td className="py-2.5 px-2 text-bl-muted whitespace-nowrap">
                            {c.estado || '—'}
                          </td>

                          <td className="py-2.5 px-2 font-num-black text-bl-ink whitespace-nowrap">
                            {formatarMoeda(c.valor_total_carrinhos)}
                          </td>

                          <td className="py-2.5 px-2 font-semibold text-bl-ink whitespace-nowrap">
                            {c.quantidade_total_itens}
                          </td>

                          <td className="py-2.5 px-2">
                            <div className="flex flex-wrap gap-1 max-w-[230px]">
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
                          </td>

                          <td className="py-2.5 px-2 whitespace-nowrap">
                            <StatusBadge status={status} />
                          </td>

                          <td className="py-2.5 pr-3 pl-2 rounded-r-2xl text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onExpandirCliente(c);
                              }}
                              className="glass-icon w-8 h-8 ml-auto"
                              title="Abrir gaveta de detalhes e confirmação"
                              aria-label="Abrir gaveta de detalhes e confirmação"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
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

        {/* COLUNA DIREITA (4 colunas): Painel Lateral de Inspeção Sincronizado */}
        <div className="xl:col-span-4 xl:sticky xl:top-6">
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
