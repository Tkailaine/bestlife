import { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Sparkles,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import type { Cliente } from '../../types';
import { ORDEM_TRILHAS, visualDaTrilha } from '../../constants/trilhas';
import { formatarMoeda, motivoLegivel, statusDoCliente } from '../../utils/format';
import { Overlay } from './Overlay';
import { Avatar } from './Avatar';
import { StatusBadge } from './Badges';

interface CustomerDetailDrawerProps {
  cliente: Cliente | null;
  onFechar: () => void;
  onConfirmarTrilhas: (clienteId: number, trilhas: string[]) => Promise<void>;
}

export function CustomerDetailDrawer({
  cliente,
  onFechar,
  onConfirmarTrilhas,
}: CustomerDetailDrawerProps) {
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!cliente) return;
    if (cliente.status_confirmacao && cliente.trilhas_confirmadas.length > 0) {
      setSelecionadas([...cliente.trilhas_confirmadas]);
    } else {
      setSelecionadas(cliente.trilhas_sugeridas.map((t) => t.nome));
    }
  }, [cliente]);

  if (!cliente) return null;

  const status = statusDoCliente(cliente);

  const toggleTrilha = (nome: string) => {
    setSelecionadas((prev) =>
      prev.includes(nome) ? prev.filter((t) => t !== nome) : [...prev, nome]
    );
  };

  const salvar = async () => {
    if (selecionadas.length === 0) return;
    setSalvando(true);
    try {
      await onConfirmarTrilhas(cliente.id, selecionadas);
      onFechar();
    } finally {
      setSalvando(false);
    }
  };

  // Ordena as trilhas selecionadas na ordem oficial de prioridade para mostrar a sequência de semanas
  const trilhasEmOrdem = ORDEM_TRILHAS.filter((t) => selecionadas.includes(t));

  return (
    <Overlay aberto={!!cliente} onFechar={onFechar} variante="drawer">
      {/* Cabeçalho translúcido do Drawer */}
      <div className="p-6 border-b border-white/70 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Avatar nome={cliente.nome_completo} size="md" className="w-12 h-12 text-sm ring-2 ring-white" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-semibold text-base text-bl-ink">
                {cliente.nome_completo}
              </h2>
              <StatusBadge status={status} />
            </div>
            <p className="text-xs text-bl-muted mt-0.5">
              Cliente #{cliente.id} • {cliente.idade} anos • {cliente.sexo} • {cliente.estado}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onFechar}
          className="glass-icon"
          aria-label="Fechar painel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Corpo rolável */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Métricas consolidadas do cliente */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-inset rounded-2xl p-3.5">
            <div className="text-[10px] text-bl-muted flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-bl-blue" />
              Valor Total
            </div>
            <div className="font-num-black text-base text-bl-ink mt-1">
              {formatarMoeda(cliente.valor_total_carrinhos)}
            </div>
          </div>

          <div className="glass-inset rounded-2xl p-3.5">
            <div className="text-[10px] text-bl-muted flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-bl-blue" />
              Total de Itens
            </div>
            <div className="font-num-black text-base text-bl-ink mt-1">
              {cliente.quantidade_total_itens} un.
            </div>
          </div>

          <div className="glass-inset rounded-2xl p-3.5">
            <div className="text-[10px] text-bl-muted flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-bl-blue" />
              Contato
            </div>
            <div className="font-semibold text-xs text-bl-ink mt-1.5 truncate font-mono">
              {cliente.telefone}
            </div>
          </div>
        </div>

        {/* Trilhas recomendadas pelo motor de regras */}
        <div className="glass-inset rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-bl-ink flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-bl-blue" />
              Diagnóstico de Classificação Automática
            </h3>
            <span className="text-[11px] text-bl-muted">Prioridade 1 → 5</span>
          </div>

          <div className="space-y-2.5">
            {cliente.trilhas_sugeridas.map((t) => {
              const vis = visualDaTrilha(t.nome);
              return (
                <div
                  key={t.nome}
                  className="bg-white/75 border border-white rounded-2xl p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                        style={{ background: vis.dot }}
                      >
                        P{vis.prioridade}
                      </span>
                      <span className="font-bold text-xs text-bl-ink">{t.nome}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-bl-muted">
                      Regra: {vis.regra}
                    </span>
                  </div>

                  <p className="text-xs text-bl-ink leading-relaxed">
                    {motivoLegivel(t.nome, cliente)}
                  </p>

                  <div className="text-[11px] font-mono text-bl-blue bg-bl-blue/8 px-2.5 py-1 rounded-xl inline-block">
                    Cálculo: {t.motivo}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ajuste manual e confirmação do Analista */}
        <div className="glass-inset rounded-3xl p-4 space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-bl-ink">
              Confirmação ou Ajuste do Analista
            </h3>
            <p className="text-[11px] text-bl-muted mt-0.5">
              Marque as trilhas que devem compor o cronograma deste cliente. Ele percorrerá uma trilha por vez (3 semanas cada), na ordem de prioridade.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {ORDEM_TRILHAS.map((nome) => {
              const marcado = selecionadas.includes(nome);
              const vis = visualDaTrilha(nome);
              const sugerida = cliente.trilhas_sugeridas.some((s) => s.nome === nome);

              return (
                <label
                  key={nome}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    marcado
                      ? 'bg-bl-ink text-white border-bl-ink shadow-sm'
                      : 'bg-white/55 border-white/80 text-bl-ink hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => toggleTrilha(nome)}
                      className="sr-only"
                    />
                    <span
                      className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        marcado ? 'bg-bl-yellow text-bl-ink' : 'border border-bl-muted/50'
                      }`}
                    >
                      {marcado ? '✓' : ''}
                    </span>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-2">
                        <span>P{vis.prioridade} · {nome}</span>
                        {sugerida && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              marcado
                                ? 'bg-white/15 text-bl-yellow'
                                : 'bg-bl-blue/10 text-bl-blue'
                            }`}
                          >
                            Recomendada
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[10px] ${
                          marcado ? 'text-white/70' : 'text-bl-muted'
                        }`}
                      >
                        {vis.regra}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold opacity-75">3 semanas</span>
                </label>
              );
            })}
          </div>

          {/* Prévia da jornada em semanas */}
          {trilhasEmOrdem.length > 0 && (
            <div className="glass-well rounded-2xl p-3 text-xs space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-bl-muted flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-bl-blue" />
                Jornada resultante ({trilhasEmOrdem.length * 3} semanas no total)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {trilhasEmOrdem.map((nome, idx) => (
                  <span
                    key={nome}
                    className="bg-white/80 border border-white rounded-xl px-2.5 py-1 text-[11px] font-semibold text-bl-ink"
                  >
                    Semanas {idx * 3 + 1}–{idx * 3 + 3}: <strong>{nome}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-bl-muted pt-1">
            <ShieldAlert className="w-4 h-4 text-bl-blue shrink-0" />
            <span>
              Somente clientes confirmados entram no cronograma de envios e na simulação Setabot.
            </span>
          </div>
        </div>
      </div>

      {/* Rodapé com ação primária */}
      <div className="p-5 border-t border-white/70 bg-white/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-bl-muted">
          <MapPin className="w-3.5 h-3.5 text-bl-blue" />
          <span>{cliente.estado || 'UF não informada'}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onFechar}
            className="px-4 py-2.5 rounded-2xl glass-inset text-xs font-semibold text-bl-ink hover:bg-white cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvar}
            disabled={salvando || selecionadas.length === 0}
            className="px-5 py-2.5 rounded-2xl bg-bl-blue hover:bg-bl-blue-deep text-white text-xs font-bold shadow-[0_14px_28px_-12px_rgba(38,77,164,0.85)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-bl-yellow" />
            {salvando ? 'Salvando no SQLite...' : 'Confirmar & Gravar Decisão'}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

