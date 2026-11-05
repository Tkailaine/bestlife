import { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
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
  onConfirmarTrilhas: (clienteId: number, trilhas: string[]) => Promise<void>;
  onIrParaCronograma?: () => void;
  onAnterior?: () => void;
  onProximo?: () => void;
}

export function CustomerInspectorPanel({
  cliente,
  onExpandirDetalhes,
  onConfirmarTrilhas,
  onAnterior,
  onProximo,
}: CustomerInspectorPanelProps) {
  const [trilhasSelecionadas, setTrilhasSelecionadas] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!cliente) return;
    if (cliente.status_confirmacao && cliente.trilhas_confirmadas.length > 0) {
      setTrilhasSelecionadas([...cliente.trilhas_confirmadas]);
    } else {
      setTrilhasSelecionadas(cliente.trilhas_sugeridas.map((t) => t.nome));
    }
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
      await onConfirmarTrilhas(cliente.id, trilhasSelecionadas);
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
    <div className="flex flex-col gap-6">
      {/* CARTÃO 1: Perfil Limpo + Diagnóstico Inteligente */}
      <section className="glass rounded-[30px] p-6 lg:p-7 rise">
        {/* Topo minimalista: Navegação entre clientes + botão expandir */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="glass-inset rounded-full px-3 py-1 text-xs font-bold text-bl-ink">
              Cliente #{cliente.id}
            </span>
            {onAnterior && onProximo && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onAnterior}
                  className="glass-icon w-8 h-8"
                  title="Cliente anterior"
                  aria-label="Cliente anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onProximo}
                  className="glass-icon w-8 h-8"
                  title="Próximo cliente"
                  aria-label="Próximo cliente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <IconButton
            label="Abrir ficha completa em tela expandida"
            onClick={() => onExpandirDetalhes(cliente)}
          >
            <ArrowUpRight className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Avatar, nome e dados essenciais com respiro */}
        <div className="flex flex-col items-center text-center mt-4 mb-6">
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-2 rounded-full bg-gradient-to-tr from-bl-blue/25 via-bl-yellow/30 to-white/50 blur-md"
            />
            <Avatar
              nome={cliente.nome_completo}
              size="lg"
              className="relative ring-4 ring-white/90 shadow-md"
            />
          </div>

          <h2 className="font-display font-bold text-xl text-bl-ink mt-3.5 leading-snug">
            {cliente.nome_completo}
          </h2>
          <p className="text-xs text-bl-muted mt-1">
            {cliente.idade} anos • {cliente.estado || 'UF N/A'} • {cliente.telefone}
          </p>

          <div className="mt-3">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* 2 Indicadores-chave lado a lado (Leitura imediata) */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="glass-inset rounded-2xl p-4 text-center">
            <div className="text-[11px] font-medium text-bl-muted">Total em Compras</div>
            <div className="font-num-black text-lg text-bl-ink mt-1">
              {formatarMoeda(cliente.valor_total_carrinhos)}
            </div>
          </div>

          <div className="glass-inset rounded-2xl p-4 text-center">
            <div className="text-[11px] font-medium text-bl-muted">Volume Acumulado</div>
            <div className="font-num-black text-lg text-bl-ink mt-1">
              {cliente.quantidade_total_itens} itens
            </div>
          </div>
        </div>

        {/* Card de Inteligência de Negócio (Apoio à decisão do analista) */}
        <div className="glass-inset rounded-2xl p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
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

      {/* CARTÃO 2: Motivos da Classificação & Decisão do Analista */}
      <section className="glass rounded-[30px] p-6 lg:p-7 rise">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-bold text-bl-ink">
              Classificação & Aprovação
            </h3>
            <p className="text-xs text-bl-muted mt-0.5">
              Por que o sistema sugeriu estas trilhas
            </p>
          </div>
          <span className="text-xs font-semibold text-bl-blue bg-bl-blue/10 px-3 py-1 rounded-full">
            {trilhasSelecionadas.length * 3} sem.
          </span>
        </div>

        {/* Lista limpa de motivos */}
        <div className="space-y-2.5 mb-6">
          {cliente.trilhas_sugeridas.map((t) => {
            const vis = visualDaTrilha(t.nome);
            return (
              <div
                key={t.nome}
                className="glass-inset rounded-2xl p-3.5 flex items-center justify-between gap-3"
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
                  <p className="text-xs text-bl-muted mt-1 leading-relaxed">
                    Motivo: <strong className="text-bl-ink">{t.motivo}</strong>
                  </p>
                </div>
                <Sparkles className="w-4 h-4 text-bl-blue shrink-0 opacity-70" />
              </div>
            );
          })}
        </div>

        {/* Ajuste de Trilhas com Pílulas Espaçosas */}
        <div className="mb-5">
          <div className="text-xs font-semibold text-bl-muted mb-2.5">
            Trilhas ativas para este cliente (clique para ajustar):
          </div>
          <div className="flex flex-wrap gap-2">
            {ORDEM_TRILHAS.map((nome) => {
              const ativa = trilhasSelecionadas.includes(nome);
              const vis = visualDaTrilha(nome);
              return (
                <button
                  key={nome}
                  type="button"
                  onClick={() => alternarTrilha(nome)}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
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

        {/* Botão Primário Único e Claro */}
        <button
          type="button"
          onClick={confirmarAgora}
          disabled={salvando || trilhasSelecionadas.length === 0}
          className="w-full py-3.5 px-5 rounded-2xl bg-bl-blue hover:bg-bl-blue-deep text-white text-xs font-bold shadow-[0_16px_32px_-12px_rgba(38,77,164,0.75)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4 text-bl-yellow" />
          {salvando
            ? 'Gravando decisão...'
            : cliente.status_confirmacao
            ? 'Atualizar Trilhas Confirmadas'
            : 'Confirmar e Inserir no Cronograma'}
        </button>
      </section>
    </div>
  );
}
