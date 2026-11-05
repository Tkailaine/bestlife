import { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Calendar,
} from 'lucide-react';
import type { Cliente } from '../../types';
import { ORDEM_TRILHAS, visualDaTrilha } from '../../constants/trilhas';
import { formatarMoeda, statusDoCliente } from '../../utils/format';
import { diagnosticarCliente } from '../../utils/intelligence';
import { Avatar } from './Avatar';
import { StatusBadge } from './Badges';
import { IconButton } from './IconButton';

interface CustomerInspectorPanelProps {
  cliente: Cliente | null;
  onExpandirDetalhes: (cliente: Cliente) => void;
  onConfirmarTrilhas: (
    clienteId: number,
    trilhas: string[],
    diaSemanaEnvio?: number | null
  ) => Promise<void>;
  onIrParaCronograma?: () => void;
  onAnterior?: () => void;
  onProximo?: () => void;
}

const OPCOES_DIA_INDIVIDUAL: Array<{ valor: number | null; rotulo: string }> = [
  { valor: null, rotulo: 'Padrão Geral' },
  { valor: 0, rotulo: 'Seg' },
  { valor: 1, rotulo: 'Ter' },
  { valor: 2, rotulo: 'Qua' },
  { valor: 3, rotulo: 'Qui' },
  { valor: 4, rotulo: 'Sex' },
];

export function CustomerInspectorPanel({
  cliente,
  onExpandirDetalhes,
  onConfirmarTrilhas,
  onAnterior,
  onProximo,
}: CustomerInspectorPanelProps) {
  const [trilhasSelecionadas, setTrilhasSelecionadas] = useState<string[]>([]);
  const [diaIndividual, setDiaIndividual] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!cliente) return;
    if (cliente.status_confirmacao && cliente.trilhas_confirmadas.length > 0) {
      setTrilhasSelecionadas([...cliente.trilhas_confirmadas]);
    } else {
      setTrilhasSelecionadas(cliente.trilhas_sugeridas.map((t) => t.nome));
    }
    setDiaIndividual(
      cliente.dia_semana_envio !== undefined ? cliente.dia_semana_envio : null
    );
  }, [cliente]);

  if (!cliente) {
    return (
      <div className="glass rounded-[30px] p-8 text-center text-sm text-bl-muted">
        Selecione um cliente ao lado para analisar o perfil e confirmar as trilhas.
      </div>
    );
  }

  const status = statusDoCliente(cliente);
  const diagnostico = diagnosticarCliente(cliente);

  const alternarTrilha = (nome: string) => {
    setTrilhasSelecionadas((atual) =>
      atual.includes(nome) ? atual.filter((t) => t !== nome) : [...atual, nome]
    );
  };

  const confirmarAgora = async () => {
    if (trilhasSelecionadas.length === 0) return;
    setSalvando(true);
    try {
      await onConfirmarTrilhas(cliente.id, trilhasSelecionadas, diaIndividual);
    } finally {
      setSalvando(false);
    }
  };

  const corSeloDiagnostico =
    diagnostico.tom === 'critico'
      ? 'bg-bl-yellow text-bl-ink'
      : diagnostico.tom === 'oportunidade'
      ? 'bg-bl-blue/12 text-bl-blue'
      : 'bg-white/80 text-bl-ink';

  return (
    <div className="flex flex-col gap-5">
      {/* CARTÃO 1: Perfil Compacto + Diagnóstico Inteligente */}
      <section className="glass rounded-[28px] p-5 lg:p-6 rise">
        {/* Topo: Navegação entre clientes + Status + Botão expandir */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="glass-inset rounded-full px-3 py-1 text-xs font-bold text-bl-ink">
              Cliente #{cliente.id}
            </span>
            {onAnterior && onProximo && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onAnterior}
                  className="glass-icon w-7 h-7"
                  title="Cliente anterior"
                  aria-label="Cliente anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onProximo}
                  className="glass-icon w-7 h-7"
                  title="Próximo cliente"
                  aria-label="Próximo cliente"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            <IconButton
              label="Abrir ficha completa em tela expandida"
              onClick={() => onExpandirDetalhes(cliente)}
            >
              <ArrowUpRight className="w-4 h-4" />
            </IconButton>
          </div>
        </div>

        {/* Cabeçalho horizontal do cliente */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="relative shrink-0">
            <div
              aria-hidden
              className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-bl-blue/25 via-bl-yellow/30 to-white/50 blur-sm"
            />
            <Avatar
              nome={cliente.nome_completo}
              size="lg"
              className="relative w-14 h-14 text-sm ring-2 ring-white/90 shadow-md"
            />
          </div>

          <div className="min-w-0">
            <h2 className="font-display font-bold text-lg text-bl-ink leading-snug truncate">
              {cliente.nome_completo}
            </h2>
            <p className="text-xs text-bl-muted mt-0.5 truncate">
              {cliente.idade} anos • {cliente.estado || 'UF N/A'} • {cliente.telefone}
            </p>
          </div>
        </div>

        {/* 2 Indicadores-chave lado a lado */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="glass-inset rounded-2xl p-3 text-center">
            <div className="text-[11px] font-medium text-bl-muted">Total em Compras</div>
            <div className="font-num-black text-base text-bl-ink mt-0.5">
              {formatarMoeda(cliente.valor_total_carrinhos)}
            </div>
          </div>

          <div className="glass-inset rounded-2xl p-3 text-center">
            <div className="text-[11px] font-medium text-bl-muted">Volume Acumulado</div>
            <div className="font-num-black text-base text-bl-ink mt-0.5">
              {cliente.quantidade_total_itens} itens
            </div>
          </div>
        </div>

        {/* Card de Inteligência de Negócio */}
        <div className="glass-inset rounded-2xl p-3.5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-bl-blue">
              <Lightbulb className="w-3.5 h-3.5" />
              Diagnóstico de Negócio
            </span>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${corSeloDiagnostico}`}
            >
              {diagnostico.selo}
            </span>
          </div>
          <p className="text-xs text-bl-ink/90 leading-relaxed">
            {diagnostico.resumoDecisao}
          </p>
        </div>
      </section>

      {/* CARTÃO 2: Motivos da Classificação, Dia de Envio & Decisão do Analista */}
      <section className="glass rounded-[28px] p-5 lg:p-6 rise">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="text-sm font-bold text-bl-ink">
              Classificação & Aprovação
            </h3>
            <p className="text-[11px] text-bl-muted mt-0.5">
              Por que estas trilhas foram recomendadas
            </p>
          </div>
          <span className="text-xs font-semibold text-bl-blue bg-bl-blue/10 px-2.5 py-1 rounded-full">
            {trilhasSelecionadas.length * 3} sem.
          </span>
        </div>

        {/* Lista limpa de motivos */}
        <div className="space-y-2 mb-4">
          {cliente.trilhas_sugeridas.map((t) => {
            const vis = visualDaTrilha(t.nome);
            return (
              <div
                key={t.nome}
                className="glass-inset rounded-2xl p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: vis.dot }}
                    />
                    <span className="font-bold text-xs text-bl-ink">
                      Prioridade {vis.prioridade} · {t.nome}
                    </span>
                  </div>
                  <p className="text-[11px] text-bl-muted mt-0.5 leading-relaxed">
                    Critério: <strong className="text-bl-ink">{t.motivo}</strong>
                  </p>
                </div>
                <Sparkles className="w-4 h-4 text-bl-blue shrink-0 opacity-70" />
              </div>
            );
          })}
        </div>

        {/* Ajuste de Trilhas com Pílulas */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-bl-muted mb-2">
            Trilhas ativas para este cliente (clique para ajustar):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ORDEM_TRILHAS.map((nome) => {
              const ativa = trilhasSelecionadas.includes(nome);
              const vis = visualDaTrilha(nome);
              return (
                <button
                  key={nome}
                  type="button"
                  onClick={() => alternarTrilha(nome)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    ativa
                      ? 'bg-bl-ink text-white shadow-sm'
                      : 'glass-inset text-bl-muted hover:text-bl-ink'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: ativa ? '#F8BF29' : vis.dot }}
                  />
                  {nome}
                </button>
              );
            })}
          </div>
        </div>

        {/* Seletor de Dia da Semana Individual (Padrão Geral vs Dia Personalizado p/ Ações como Black Friday) */}
        <div className="mb-4 pt-3 border-t border-white/60">
          <div className="text-[11px] font-semibold text-bl-muted mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-bl-blue" />
              Dia de envio deste cliente:
            </span>
            {diaIndividual !== null && (
              <span className="text-[10px] font-bold text-bl-blue">
                Personalizado
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {OPCOES_DIA_INDIVIDUAL.map((op) => {
              const selecionado = diaIndividual === op.valor;
              return (
                <button
                  key={String(op.valor)}
                  type="button"
                  onClick={() => setDiaIndividual(op.valor)}
                  className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    selecionado
                      ? 'bg-bl-blue text-white shadow-sm'
                      : 'glass-inset text-bl-muted hover:text-bl-ink'
                  }`}
                >
                  {op.rotulo}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botão Primário Sempre Visível */}
        <button
          type="button"
          onClick={confirmarAgora}
          disabled={salvando || trilhasSelecionadas.length === 0}
          className="w-full py-3 px-5 rounded-2xl bg-bl-blue hover:bg-bl-blue-deep text-white text-xs font-bold shadow-[0_16px_32px_-12px_rgba(38,77,164,0.75)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4 text-bl-yellow" />
          {salvando
            ? 'Salvando confirmação...'
            : cliente.status_confirmacao
            ? 'Salvar Alterações do Cliente'
            : 'Confirmar e Inserir no Cronograma'}
        </button>
      </section>
    </div>
  );
}
