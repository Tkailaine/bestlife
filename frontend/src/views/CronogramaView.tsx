import { useState } from 'react';
import {
  CalendarDays,
  Users,
  Layers,
  MessageCircle,
  Clock,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import type { CronogramaItem, TabType } from '../types';
import { ORDEM_TRILHAS, visualDaTrilha } from '../constants/trilhas';
import { formatarDataLonga, paraData } from '../utils/format';
import { PageHeader, type Indicador } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { SendCalendar } from '../components/ui/SendCalendar';
import { Avatar } from '../components/ui/Avatar';
import { TrilhaBadge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/EmptyState';

interface CronogramaViewProps {
  cronograma: CronogramaItem[];
  isLoading: boolean;
  onNavigate: (tab: TabType) => void;
}

const DIAS_SEMANA_CONFIG = [
  { offset: 0, rotulo: 'Segunda-feira' },
  { offset: 1, rotulo: 'Terça-feira' },
  { offset: 2, rotulo: 'Quarta-feira' },
  { offset: 3, rotulo: 'Quinta-feira' },
  { offset: 4, rotulo: 'Sexta-feira' },
];

function deslocarDataIso(dataIso: string, diasExtras: number): string {
  if (diasExtras === 0) return dataIso;
  const d = paraData(dataIso);
  d.setDate(d.getDate() + diasExtras);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

export function CronogramaView({
  cronograma,
  isLoading,
  onNavigate,
}: CronogramaViewProps) {
  const [filtroTrilha, setFiltroTrilha] = useState('Todas');
  const [dataSelecionada, setDataSelecionada] = useState<string | null>(null);
  const [diaSemanaOffset, setDiaSemanaOffset] = useState(0);

  // Aplica o dia da semana configurável (preservando a cadência de 1 msg/semana do backend)
  const cronogramaAjustado = cronograma.map((item) => ({
    ...item,
    data_envio: deslocarDataIso(item.data_envio, diaSemanaOffset),
  }));

  const clientesUnicos = new Set(cronogramaAjustado.map((i) => i.cliente_id)).size;
  const semanasUnicas = new Set(cronogramaAjustado.map((i) => i.data_envio)).size;

  const itensFiltrados = cronogramaAjustado.filter((item) => {
    const okTrilha = filtroTrilha === 'Todas' || item.trilha === filtroTrilha;
    const okData = !dataSelecionada || item.data_envio === dataSelecionada;
    return okTrilha && okData;
  });

  // Agrupa por data prevista
  const gruposPorData: Record<string, CronogramaItem[]> = {};
  for (const item of itensFiltrados) {
    if (!gruposPorData[item.data_envio]) gruposPorData[item.data_envio] = [];
    gruposPorData[item.data_envio].push(item);
  }

  const indicadores: Indicador[] = [
    {
      icon: CalendarDays,
      valor: cronogramaAjustado.length,
      chip: { texto: `${semanasUnicas} semanas`, tom: 'amarelo' },
      legenda: 'Total de disparos semanais programados',
    },
    {
      icon: Users,
      valor: clientesUnicos,
      formato: (n) => `+${n}`,
      chip: { texto: 'Confirmados', tom: 'azul' },
      legenda: 'Clientes aprovados pelo analista no fluxo',
    },
    {
      icon: Layers,
      valor: 3,
      formato: (n) => `${n} msgs`,
      chip: { texto: '1 por semana', tom: 'vidro' },
      legenda: 'Cadência sequencial por trilha prioritária',
    },
  ];

  return (
    <div>
      <PageHeader
        linha1="Cronograma"
        linha2="Semanal de Envios"
        indicadores={indicadores}
        onVoltar={() => onNavigate('dashboard')}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* COLUNA ESQUERDA (5 colunas): Calendário + Configuração de Dia da Semana & Regras */}
        <div className="xl:col-span-5 flex flex-col gap-5 xl:sticky xl:top-6">
          <Panel
            title="Calendário de Disparos"
            subtitle="Clique em um dia destacado para filtrar os envios daquela semana"
            delay={70}
            actions={
              dataSelecionada ? (
                <button
                  type="button"
                  onClick={() => setDataSelecionada(null)}
                  className="glass-inset rounded-full px-3 py-1 text-[11px] font-semibold text-bl-blue flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Ver todas as semanas
                </button>
              ) : undefined
            }
          >
            <SendCalendar
              itens={cronogramaAjustado}
              dataSelecionada={dataSelecionada}
              onSelecionarData={setDataSelecionada}
            />
          </Panel>

          <Panel
            title="Cadência & Dia da Semana Configurável"
            subtitle="Todas as mensagens saem sempre no mesmo dia da semana"
            delay={140}
          >
            <div className="flex flex-wrap gap-1.5 mb-4">
              {DIAS_SEMANA_CONFIG.map((d) => {
                const ativo = diaSemanaOffset === d.offset;
                return (
                  <button
                    key={d.rotulo}
                    type="button"
                    onClick={() => {
                      setDiaSemanaOffset(d.offset);
                      setDataSelecionada(null);
                    }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      ativo
                        ? 'bg-bl-blue text-white shadow-sm'
                        : 'glass-inset text-bl-ink hover:bg-white/80'
                    }`}
                  >
                    {d.rotulo}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 text-xs text-bl-muted border-t border-white/60 pt-3">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-bl-blue shrink-0 mt-0.5" />
                <span>
                  <strong className="text-bl-ink">Uma trilha por vez:</strong> o cliente conclui as 3 semanas da trilha de maior prioridade antes de iniciar a seguinte.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-bl-blue shrink-0 mt-0.5" />
                <span>
                  <strong className="text-bl-ink">Apenas confirmados:</strong> somente clientes aprovados pelo analista entram nesta fila.
                </span>
              </div>
            </div>
          </Panel>
        </div>

        {/* COLUNA DIREITA (7 colunas): Timeline Semanal Detalhada */}
        <div className="xl:col-span-7 flex flex-col gap-5">
          {/* Pílulas de filtro por Trilha */}
          <Panel delay={100}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {['Todas', ...ORDEM_TRILHAS].map((trilha) => {
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

              <span className="text-[11px] text-bl-muted font-medium">
                {itensFiltrados.length} envio(s) exibido(s)
              </span>
            </div>
          </Panel>

          {/* Lista de Semanas */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 skeleton" />
              ))}
            </div>
          ) : Object.keys(gruposPorData).length === 0 ? (
            <Panel>
              <EmptyState
                icon={CalendarDays}
                titulo="Nenhum envio previsto para este filtro"
                texto="Confirme clientes na aba Clientes para popular o cronograma ou limpe o filtro selecionado."
                acao={
                  <button
                    type="button"
                    onClick={() => onNavigate('clientes')}
                    className="px-4 py-2 rounded-full bg-bl-blue text-white text-xs font-bold cursor-pointer"
                  >
                    Ir para Clientes & Trilhas
                  </button>
                }
              />
            </Panel>
          ) : (
            Object.entries(gruposPorData).map(([dataEnvio, envios], idx) => (
              <Panel
                key={dataEnvio}
                title={`Semana ${envios[0].semana_relativa} · ${formatarDataLonga(dataEnvio)}`}
                subtitle={`Data prevista: ${dataEnvio} • ${envios.length} disparo(s) programado(s)`}
                delay={120 + idx * 50}
                actions={
                  <span className="glass-inset rounded-full px-3 py-1 text-[11px] font-bold text-bl-blue">
                    Lote S{envios[0].semana_relativa}
                  </span>
                }
              >
                <div className="space-y-3">
                  {envios.map((item, i) => (
                    <div
                      key={`${item.cliente_id}-${item.trilha}-${item.numero_mensagem}-${i}`}
                      className="glass-inset rounded-2xl p-4 space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar nome={item.nome_cliente} size="md" />
                          <div>
                            <div className="font-bold text-xs text-bl-ink">
                              {item.nome_cliente}
                            </div>
                            <div className="text-[10px] text-bl-muted font-mono">
                              {item.telefone}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <TrilhaBadge nome={item.trilha} confirmada />
                          <span className="glass-well rounded-full px-2.5 py-1 text-[10px] font-bold text-bl-ink flex items-center gap-1.5">
                            <span>Msg {item.numero_mensagem}/3</span>
                            <span className="flex gap-0.5">
                              {[1, 2, 3].map((passo) => (
                                <span
                                  key={passo}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    passo <= item.numero_mensagem
                                      ? 'bg-bl-blue'
                                      : 'bg-bl-muted/30'
                                  }`}
                                />
                              ))}
                            </span>
                          </span>
                          <span className="rounded-full bg-bl-yellow/80 text-bl-ink px-2.5 py-1 text-[10px] font-bold">
                            Programado
                          </span>
                        </div>
                      </div>

                      {/* Balão translúcido com a mensagem personalizada */}
                      <div className="glass-well rounded-2xl p-3 flex items-start gap-2.5 text-xs text-bl-ink">
                        <MessageCircle className="w-4 h-4 text-bl-blue shrink-0 mt-0.5" />
                        <p className="leading-relaxed">“{item.mensagem}”</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
