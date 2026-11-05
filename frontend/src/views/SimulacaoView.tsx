import { useState, useEffect } from 'react';
import {
  Send,
  History,
  Terminal,
  ShieldCheck,
  ArrowUpRight,
  Phone,
  Calendar,
  X,
  Code2,
} from 'lucide-react';
import type { HistoricoSimulacao, TabType } from '../types';
import { PageHeader, type Indicador } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { Avatar } from '../components/ui/Avatar';
import { TrilhaBadge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/EmptyState';
import { Overlay } from '../components/ui/Overlay';
import { IconButton } from '../components/ui/IconButton';

interface SimulacaoViewProps {
  historico: HistoricoSimulacao[];
  isLoading: boolean;
  onSimularHoje: () => Promise<void>;
  isSimulating: boolean;
  onNavigate: (tab: TabType) => void;
}

export function SimulacaoView({
  historico,
  isLoading,
  onSimularHoje,
  isSimulating,
  onNavigate,
}: SimulacaoViewProps) {
  const [selecionado, setSelecionado] = useState<HistoricoSimulacao | null>(null);
  const [modalAberto, setModalAberto] = useState<HistoricoSimulacao | null>(null);

  useEffect(() => {
    if (historico.length > 0 && !selecionado) {
      setSelecionado(historico[0]);
    } else if (historico.length > 0 && selecionado) {
      const atualizado = historico.find((h) => h.id === selecionado.id) ?? historico[0];
      setSelecionado(atualizado);
    }
  }, [historico, selecionado]);

  const clientesUnicos = new Set(historico.map((h) => h.cliente_id)).size;

  const indicadores: Indicador[] = [
    {
      icon: History,
      valor: historico.length,
      chip: { texto: 'Gravados no SQLite', tom: 'amarelo' },
      legenda: 'Total de requisições simuladas na auditoria',
    },
    {
      icon: Send,
      valor: clientesUnicos,
      formato: (n) => `+${n}`,
      chip: { texto: 'Setabot API', tom: 'azul' },
      legenda: 'Clientes impactados nos lotes simulados',
    },
    {
      icon: ShieldCheck,
      valor: 100,
      formato: (n) => `${n}%`,
      chip: { texto: 'Sem disparo real', tom: 'vidro' },
      legenda: 'Token seguro lido de variável de ambiente',
    },
  ];

  return (
    <div>
      <PageHeader
        linha1="Histórico &"
        linha2="Simulação WhatsApp"
        indicadores={indicadores}
        onVoltar={() => onNavigate('dashboard')}
        extra={
          <button
            type="button"
            onClick={onSimularHoje}
            disabled={isSimulating}
            className="px-5 py-3 rounded-full bg-bl-blue hover:bg-bl-blue-deep text-white text-xs font-bold shadow-[0_18px_34px_-14px_rgba(38,77,164,0.85)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-bl-yellow" />
            {isSimulating ? 'Simulando lote...' : 'Simular envios de hoje'}
          </button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
        {/* COLUNA ESQUERDA (7 colunas): Lista de Envios Simulados */}
        <div className="xl:col-span-7">
          <Panel
            title="Registro de Envios Simulados"
            subtitle="Clique em um registro para inspecionar a requisição HTTP montada para a Setabot"
            delay={70}
          >
            {isLoading ? (
              <div className="space-y-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 skeleton" />
                ))}
              </div>
            ) : historico.length === 0 ? (
              <EmptyState
                icon={Send}
                titulo="Nenhuma simulação executada ainda"
                texto="Clique no botão 'Simular envios de hoje' no topo da página para montar e gravar as requisições HTTP da primeira semana."
                acao={
                  <button
                    type="button"
                    onClick={onSimularHoje}
                    disabled={isSimulating}
                    className="px-5 py-2.5 rounded-full bg-bl-blue text-white text-xs font-bold cursor-pointer"
                  >
                    Simular envios de hoje
                  </button>
                }
              />
            ) : (
              <div className="space-y-2.5">
                {historico.map((item) => {
                  const ativo = selecionado?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelecionado(item)}
                      className={`rounded-2xl p-4 transition-all cursor-pointer ${
                        ativo
                          ? 'bg-white/90 shadow-md ring-1 ring-bl-blue/45'
                          : 'glass-inset hover:bg-white/75'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar nome={item.nome_cliente} size="md" />
                          <div>
                            <div className="font-bold text-xs text-bl-ink">
                              {item.nome_cliente}
                            </div>
                            <div className="text-[10px] text-bl-muted font-mono">
                              {item.telefone} • Previsto: {item.data_envio}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <TrilhaBadge nome={item.trilha} confirmada />
                          <span className="rounded-full bg-bl-blue text-white px-2.5 py-0.5 text-[10px] font-bold">
                            Simulado
                          </span>
                          <IconButton
                            label="Expandir JSON em modal"
                            onClick={() => setModalAberto(item)}
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </IconButton>
                        </div>
                      </div>

                      <p className="text-xs text-bl-ink/85 line-clamp-2 pl-11">
                        “{item.mensagem}”
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        {/* COLUNA DIREITA (5 colunas): Inspecionador da Requisição HTTP Setabot */}
        <div className="xl:col-span-5 xl:sticky xl:top-6">
          <Panel
            title="Inspeção da Requisição Setabot"
            subtitle="Endpoint, método, cabeçalhos e corpo gravados no histórico"
            delay={140}
            actions={
              selecionado ? (
                <IconButton
                  label="Abrir em tela cheia"
                  onClick={() => setModalAberto(selecionado)}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </IconButton>
              ) : undefined
            }
          >
            {!selecionado ? (
              <EmptyState
                icon={Terminal}
                titulo="Selecione um envio ao lado"
                texto="O payload HTTP formatado para a plataforma Setabot aparecerá aqui."
              />
            ) : (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="glass-inset rounded-2xl p-3">
                    <div className="text-[10px] text-bl-muted flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-bl-blue" />
                      Telefone Convertido
                    </div>
                    <div className="font-mono font-bold text-bl-ink mt-1">
                      {selecionado.telefone}
                    </div>
                  </div>

                  <div className="glass-inset rounded-2xl p-3">
                    <div className="text-[10px] text-bl-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-bl-blue" />
                      Data Prevista
                    </div>
                    <div className="font-bold text-bl-ink mt-1">
                      {selecionado.data_envio}
                    </div>
                  </div>
                </div>

                {/* Endpoint e método */}
                <div className="glass-inset rounded-2xl p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-bl-blue text-white font-mono text-[10px] font-bold">
                      {selecionado.requisicao_simulada?.metodo ?? 'POST'}
                    </span>
                    <span className="font-mono text-[11px] text-bl-ink truncate">
                      {selecionado.requisicao_simulada?.url}
                    </span>
                  </div>
                </div>

                {/* JSON formatado */}
                <div className="rounded-2xl bg-[#14161B] text-emerald-300 p-4 font-mono text-[11px] overflow-x-auto leading-relaxed shadow-inner border border-white/10">
                  <pre className="m-0">
                    {JSON.stringify(selecionado.requisicao_simulada, null, 2)}
                  </pre>
                </div>

                <p className="text-[11px] text-bl-muted leading-relaxed">
                  • Variável <code className="text-bl-ink font-semibold">{'{nome}'}</code> substituída pelo primeiro nome do cliente.
                  <br />• Token obtido via <code className="text-bl-ink font-semibold">WHATSAPP_API_TOKEN</code> no backend.
                </p>
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* Modal com Fundo Desfocado para Inspeção Completa do Payload */}
      <Overlay aberto={!!modalAberto} onFechar={() => setModalAberto(null)} variante="modal">
        {modalAberto && (
          <>
            <div className="p-6 border-b border-white/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-bl-blue text-white flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm text-bl-ink">
                    Requisição Simulada #{modalAberto.id} · Setabot API
                  </h3>
                  <p className="text-xs text-bl-muted">
                    Cliente: {modalAberto.nome_cliente} ({modalAberto.telefone})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalAberto(null)}
                className="glass-icon"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="glass-inset rounded-2xl p-4 text-xs space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-bl-muted">
                  Mensagem Personalizada
                </div>
                <p className="text-bl-ink font-medium leading-relaxed">
                  “{modalAberto.mensagem}”
                </p>
              </div>

              <div className="rounded-2xl bg-[#14161B] text-emerald-300 p-4 font-mono text-xs overflow-x-auto leading-relaxed">
                <pre className="m-0">
                  {JSON.stringify(modalAberto.requisicao_simulada, null, 2)}
                </pre>
              </div>
            </div>
          </>
        )}
      </Overlay>
    </div>
  );
}
