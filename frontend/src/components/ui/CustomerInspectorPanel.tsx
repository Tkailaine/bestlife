import { useState, useEffect } from 'react';
import {
  MoreHorizontal,
  ArrowUpRight,
  Check,
  Sparkles,
  MessageCircle,
  Phone,
  Calendar,
  Pencil,
  User,
  MapPin,
  ShoppingBag,
  Layers,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Cliente } from '../../types';
import { ORDEM_TRILHAS, visualDaTrilha } from '../../constants/trilhas';
import { formatarMoeda, motivoLegivel, statusDoCliente } from '../../utils/format';
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

// Coluna direita inspirada diretamente no cartão "Eva Robinson" + "Detailed Information" da referência Salesforce
export function CustomerInspectorPanel({
  cliente,
  onExpandirDetalhes,
  onConfirmarTrilhas,
  onIrParaCronograma,
  onAnterior,
  onProximo,
}: CustomerInspectorPanelProps) {
  const [trilhasSelecionadas, setTrilhasSelecionadas] = useState<string[]>([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!cliente) return;
    if (cliente.status_confirmacao && cliente.trilhas_confirmadas.length > 0) {
      setTrilhasSelecionadas([...cliente.trilhas_confirmadas]);
    } else {
      setTrilhasSelecionadas(cliente.trilhas_sugeridas.map((t) => t.nome));
    }
    setModoEdicao(false);
  }, [cliente]);

  if (!cliente) {
    return (
      <div className="glass rounded-[28px] p-6 text-center text-xs text-bl-muted">
        Selecione um cliente para inspecionar os detalhes.
      </div>
    );
  }

  const status = statusDoCliente(cliente);

  const alternarTrilha = (nome: string) => {
    setModoEdicao(true);
    setTrilhasSelecionadas((atual) =>
      atual.includes(nome) ? atual.filter((t) => t !== nome) : [...atual, nome]
    );
  };

  const confirmarAgora = async () => {
    if (trilhasSelecionadas.length === 0) return;
    setSalvando(true);
    try {
      await onConfirmarTrilhas(cliente.id, trilhasSelecionadas);
      setModoEdicao(false);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* CARTÃO SUPERIOR: Perfil Flutuante (Inspirado no card "Eva Robinson") */}
      <section className="glass rounded-[28px] p-5 rise" style={{ '--d': '140ms' } as React.CSSProperties}>
        {/* Topo do cartão com pílulas flutuantes e ações */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="glass-inset rounded-full px-2.5 py-1 text-[11px] font-bold text-bl-ink flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  cliente.status_confirmacao ? 'bg-emerald-500' : 'bg-bl-yellow'
                }`}
              />
              #{cliente.id}
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

          <div className="flex items-center gap-1.5">
            <IconButton label="Alternar edição de trilhas" onClick={() => setModoEdicao((v) => !v)}>
              <MoreHorizontal className="w-4 h-4" />
            </IconButton>
            <IconButton label="Abrir painel completo do cliente" onClick={() => onExpandirDetalhes(cliente)}>
              <ArrowUpRight className="w-4 h-4" />
            </IconButton>
          </div>
        </div>

        {/* Avatar central com halo luminoso + Nome e Subtítulo */}
        <div className="flex flex-col items-center text-center mt-2 mb-4">
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-2 rounded-full bg-gradient-to-tr from-bl-blue/30 via-bl-yellow/35 to-white/60 blur-md"
            />
            <Avatar
              nome={cliente.nome_completo}
              size="lg"
              className="relative ring-4 ring-white/85 shadow-lg"
            />
          </div>

          <h2 className="font-display font-semibold text-lg text-bl-ink mt-3 leading-tight">
            {cliente.nome_completo}
          </h2>
          <p className="text-xs text-bl-muted mt-1">
            {cliente.idade} anos • {cliente.estado || 'UF N/A'} •{' '}
            {cliente.trilhas_sugeridas[0]?.nome ?? 'Geral'}
          </p>
          <div className="mt-2">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Barra de 6 botões circulares translúcidos (como na referência Salesforce) */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/60">
          <button
            type="button"
            onClick={confirmarAgora}
            disabled={salvando}
            title="Confirmar trilhas selecionadas"
            className="glass-icon w-9 h-9 bg-bl-blue/90 text-white hover:bg-bl-blue border-bl-blue/40"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setModoEdicao((v) => !v)}
            title="Ajustar trilhas manualmente"
            className="glass-icon w-9 h-9"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onExpandirDetalhes(cliente)}
            title="Ver motivos detalhados da classificação"
            className="glass-icon w-9 h-9"
          >
            <Sparkles className="w-3.5 h-3.5 text-bl-blue" />
          </button>
          <button
            type="button"
            onClick={() => onExpandirDetalhes(cliente)}
            title={`Telefone: ${cliente.telefone}`}
            className="glass-icon w-9 h-9"
          >
            <Phone className="w-3.5 h-3.5" />
          </button>
          {onIrParaCronograma && (
            <button
              type="button"
              onClick={onIrParaCronograma}
              title="Ver no cronograma semanal"
              className="glass-icon w-9 h-9"
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onExpandirDetalhes(cliente)}
            title="Prévia das mensagens de WhatsApp"
            className="glass-icon w-9 h-9"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* CARTÃO INFERIOR: "Detailed Information" + Classificação e Aprovação */}
      <section className="glass rounded-[28px] p-5 rise" style={{ '--d': '220ms' } as React.CSSProperties}>
        <header className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[13px] font-semibold text-bl-ink">Ficha & Classificação</h3>
            <p className="text-[11px] text-bl-muted">Dados reais consolidados + decisão do analista</p>
          </div>
          <div className="flex items-center gap-1.5">
            <IconButton label="Ajustar trilhas" onClick={() => setModoEdicao((v) => !v)}>
              <Pencil className="w-3.5 h-3.5" />
            </IconButton>
            <IconButton label="Expandir ficha completa" onClick={() => onExpandirDetalhes(cliente)}>
              <ArrowUpRight className="w-4 h-4" />
            </IconButton>
          </div>
        </header>

        {/* Linhas de informação estruturadas exatamente como "Detailed Information" */}
        <div className="divide-y divide-white/60 text-xs">
          <div className="py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <User className="w-4 h-4 text-bl-muted shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-bl-muted">Cliente & Perfil</div>
                <div className="font-semibold text-bl-ink truncate">
                  {cliente.nome_completo} ({cliente.sexo}, {cliente.idade}a)
                </div>
              </div>
            </div>
            <span className="glass-icon w-7 h-7 cursor-default text-[10px] font-bold">
              {cliente.idade}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <ShoppingBag className="w-4 h-4 text-bl-muted shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-bl-muted">Total em Carrinhos</div>
                <div className="font-num-black text-sm text-bl-ink">
                  {formatarMoeda(cliente.valor_total_carrinhos)}{' '}
                  <span className="text-[11px] font-normal text-bl-muted">
                    • {cliente.quantidade_total_itens} itens
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onExpandirDetalhes(cliente)}
              className="glass-icon w-7 h-7"
              title="Ver detalhes de compras"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Phone className="w-4 h-4 text-bl-muted shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-bl-muted">Telefone (WhatsApp)</div>
                <div className="font-semibold text-bl-ink font-mono">{cliente.telefone}</div>
              </div>
            </div>
            <span className="glass-icon w-7 h-7 cursor-default">
              <MapPin className="w-3.5 h-3.5 text-bl-blue" />
            </span>
          </div>

          {/* Motivos das Trilhas Recomendadas */}
          <div className="py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-bl-muted flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-bl-blue" />
                Motivos da Classificação
              </span>
              <span className="text-[10px] text-bl-muted">
                {cliente.trilhas_sugeridas.length} sugerida(s)
              </span>
            </div>

            <div className="space-y-1.5">
              {cliente.trilhas_sugeridas.map((t) => {
                const vis = visualDaTrilha(t.nome);
                return (
                  <div
                    key={t.nome}
                    className="glass-inset rounded-2xl p-2.5 flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: vis.dot }}
                        />
                        <span className="font-bold text-bl-ink text-[11px]">
                          P{vis.prioridade} · {t.nome}
                        </span>
                      </div>
                      <p className="text-[11px] text-bl-muted mt-0.5 leading-snug">
                        {motivoLegivel(t.nome, cliente)}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-mono text-bl-blue bg-bl-blue/8 px-2 py-0.5 rounded-full">
                        Regra: {t.motivo}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seleção / Ajuste Rápido pelo Analista */}
          <div className="pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-bl-muted">
                Decisão do Analista (Clique para ajustar)
              </span>
              {modoEdicao && (
                <span className="text-[10px] font-bold text-bl-blue">Editando</span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {ORDEM_TRILHAS.map((nome) => {
                const ativa = trilhasSelecionadas.includes(nome);
                const vis = visualDaTrilha(nome);
                return (
                  <button
                    key={nome}
                    type="button"
                    onClick={() => alternarTrilha(nome)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      ativa
                        ? 'bg-bl-ink text-white shadow-xs scale-[1.02]'
                        : 'glass-well text-bl-muted hover:text-bl-ink'
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: ativa ? '#F8BF29' : vis.dot }}
                    />
                    {nome}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={confirmarAgora}
              disabled={salvando || trilhasSelecionadas.length === 0}
              className="w-full py-2.5 px-4 rounded-2xl bg-bl-blue hover:bg-bl-blue-deep text-white text-xs font-bold shadow-[0_14px_28px_-12px_rgba(38,77,164,0.85)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-bl-yellow" />
              {salvando
                ? 'Gravando decisão...'
                : cliente.status_confirmacao
                ? 'Atualizar Trilhas no Banco'
                : 'Confirmar Cliente no Cronograma'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

