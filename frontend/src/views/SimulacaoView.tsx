import { useState, useEffect } from 'react';
import {
  Send,
  History,
  ShieldCheck,
  ArrowUpRight,
  Phone,
  Calendar,
  X,
  MessageCircle,
  CheckCircle2,
  ChevronDown,
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
      chip: { texto: 'Registrados', tom: 'amarelo' },
      legenda: 'Total de mensagens enviadas na simulação',
    },
    {
      icon: Send,
      valor: clientesUnicos,
      formato: (n) => `${n}`,
      chip: { texto: 'WhatsApp', tom: 'azul' },
      legenda: 'Clientes atendidos nos lotes disparados',
    },
    {
      icon: ShieldCheck,
      valor: 100,
      formato: (n) => `${n}%`,
      chip: { texto: 'Modo seguro', tom: 'vidro' },
      legenda: 'Validação segura sem disparo real ao cliente',
    },
  ];

  return (
    <div>
      <PageHeader
        linha1="Histórico &"
        linha2="Envios de WhatsApp"
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
            {isSimulating ? 'Processando lote...' : 'Simular envios de hoje'}
          </button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
        {/* COLUNA ESQUERDA (7 colunas): Lista de Envios Simulados */}
        <div className="xl:col-span-7">
          <Panel
            title="Mensagens Processadas"
            subtitle="Clique em qualquer envio para conferir a mensagem personalizada e os dados do destinatário"
            delay={70}
          >
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 skeleton" />
                ))}
              </div>
            ) : historico.length === 0 ? (
              <EmptyState
                icon={Send}
                titulo="Nenhum envio registrado ainda"
                texto="Clique no botão 'Simular envios de hoje' no topo da página para processar o lote da primeira semana."
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
              <div className="space-y-3">
                {historico.map((item) => {
                  const ativo = selecionado?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelecionado(item)}
                      className={`rounded-2xl p-4 transition-all cursor-pointer ${
                        ativo
                          ? 'bg-white/95 shadow-md ring-1 ring-bl-blue/45'
                          : 'glass-inset hover:bg-white/80'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-3">
                          <Avatar nome={item.nome_cliente} size="md" />
                          <div>
                            <div className="font-bold text-sm text-bl-ink">
                              {item.nome_cliente}
                            </div>
                            <div className="text-[11px] text-bl-muted mt-0.5">
                              {item.telefone} • Data do lote: {item.data_envio}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <TrilhaBadge nome={item.trilha} confirmada />
                          <span className="rounded-full bg-bl-blue text-white px-2.5 py-0.5 text-[10px] font-bold">
                            Registrado
                          </span>
                          <IconButton
                            label="Ver comprovante completo"
                            onClick={() => setModalAberto(item)}
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </IconButton>
                        </div>
                      </div>

                      <p className="text-xs text-bl-ink/85 line-clamp-2 pl-12 leading-relaxed">
                        “{item.mensagem}”
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        {/* COLUNA DIREITA (5 colunas): Prévia Amigável do Envio WhatsApp */}
        <div className="xl:col-span-5 xl:sticky xl:top-6">
          <Panel
            title="Detalhes do Envio WhatsApp"
            subtitle="Conferência da mensagem personalizada e do destinatário"
            delay={140}
            actions={
              selecionado ? (
                <IconButton
                  label="Expandir comprovante"
                  onClick={() => setModalAberto(selecionado)}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </IconButton>
              ) : undefined
            }
          >
            {!selecionado ? (
              <EmptyState
                icon={MessageCircle}
                titulo="Selecione um envio ao lado"
                texto="Os detalhes da mensagem personalizada de WhatsApp aparecerão aqui."
              />
            ) : (
              <div className="space-y-4">
                {/* Destinatário e Status */}
                <div className="glass-inset rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar nome={selecionado.nome_cliente} size="md" />
                    <div>
                      <div className="font-bold text-sm text-bl-ink">
                        {selecionado.nome_cliente}
                      </div>
                      <div className="text-xs text-bl-muted">
                        Trilha: <strong className="text-bl-ink">{selecionado.trilha}</strong>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-800 px-3 py-1 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Pronto p/ envio
                  </span>
                </div>

                {/* Telefone e Data */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="glass-inset rounded-2xl p-3.5">
                    <div className="text-[11px] text-bl-muted flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-bl-blue" />
                      WhatsApp Destino
                    </div>
                    <div className="font-bold text-sm text-bl-ink mt-1">
                      {selecionado.telefone}
                    </div>
                  </div>

                  <div className="glass-inset rounded-2xl p-3.5">
                    <div className="text-[11px] text-bl-muted flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-bl-blue" />
                      Data Programada
                    </div>
                    <div className="font-bold text-sm text-bl-ink mt-1">
                      {selecionado.data_envio}
                    </div>
                  </div>
                </div>

                {/* Balão de Prévia da Mensagem no WhatsApp */}
                <div className="glass-well rounded-2xl p-4 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-bl-blue flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Mensagem Personalizada
                  </div>
                  <p className="text-sm text-bl-ink leading-relaxed">
                    “{selecionado.mensagem}”
                  </p>
                </div>

                {/* Gaveta recolhida opcional para os dados de integração Setabot */}
                <details className="glass-inset rounded-2xl p-3.5 text-xs group">
                  <summary className="font-semibold text-bl-muted hover:text-bl-ink cursor-pointer flex items-center justify-between list-none">
                    <span>Dados de integração com a plataforma Setabot</span>
                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-3 rounded-xl bg-[#14161B] text-emerald-300 p-3.5 font-mono text-[11px] overflow-x-auto leading-relaxed">
                    <pre className="m-0">
                      {JSON.stringify(selecionado.requisicao_simulada, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* Modal com Fundo Desfocado para Visualização Completa do Envio */}
      <Overlay aberto={!!modalAberto} onFechar={() => setModalAberto(null)} variante="modal">
        {modalAberto && (
          <>
            <div className="p-6 border-b border-white/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-bl-blue text-white flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm text-bl-ink">
                    Comprovante de Envio #{modalAberto.id} · Canal WhatsApp
                  </h3>
                  <p className="text-xs text-bl-muted">
                    Destinatário: {modalAberto.nome_cliente} ({modalAberto.telefone})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalAberto(null)}
                className="glass-icon"
                aria-label="Fechar janela"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="glass-inset rounded-2xl p-4 text-xs space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-bl-muted">
                  Mensagem Enviada na Trilha {modalAberto.trilha}
                </div>
                <p className="text-sm text-bl-ink font-medium leading-relaxed">
                  “{modalAberto.mensagem}”
                </p>
              </div>

              <details className="glass-inset rounded-2xl p-4 text-xs group">
                <summary className="font-semibold text-bl-muted hover:text-bl-ink cursor-pointer flex items-center justify-between list-none">
                  <span>Ver registro de comunicação Setabot</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-3 rounded-2xl bg-[#14161B] text-emerald-300 p-4 font-mono text-xs overflow-x-auto leading-relaxed">
                  <pre className="m-0">
                    {JSON.stringify(modalAberto.requisicao_simulada, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          </>
        )}
      </Overlay>
    </div>
  );
}
