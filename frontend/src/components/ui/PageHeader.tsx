import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

export interface Indicador {
  icon: ComponentType<{ className?: string }>;
  valor: number;
  formato?: (n: number) => string;
  chip?: { texto: string; tom: 'amarelo' | 'azul' | 'vidro' };
  legenda: string;
}

const tonsChip = {
  amarelo: 'bg-bl-yellow text-bl-ink shadow-xs',
  azul: 'bg-bl-blue text-white shadow-xs',
  vidro: 'bg-white/85 border border-white text-bl-ink',
};

function IndicadorItem({ item, delay }: { item: Indicador; delay: number }) {
  const valorAnimado = useCountUp(item.valor);
  const Icon = item.icon;

  return (
    <div
      className="flex items-start gap-3.5 rise"
      style={{ '--d': `${delay}ms` } as CSSProperties}
    >
      <div className="glass-icon w-11 h-11 cursor-default shrink-0">
        <Icon className="w-4 h-4 text-bl-ink" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-num-black text-[22px] text-bl-ink leading-none">
            {item.formato ? item.formato(valorAnimado) : valorAnimado}
          </span>
          {item.chip && (
            <span
              className={`text-[11px] font-bold rounded-full px-2.5 py-0.5 whitespace-nowrap ${tonsChip[item.chip.tom]}`}
            >
              {item.chip.texto}
            </span>
          )}
        </div>
        <p className="text-xs text-bl-muted mt-1.5 leading-snug max-w-[180px]">
          {item.legenda}
        </p>
      </div>
    </div>
  );
}

interface PageHeaderProps {
  linha1: string;
  linha2: string;
  indicadores: Indicador[];
  onVoltar?: () => void;
  extra?: ReactNode;
}

export function PageHeader({
  linha1,
  linha2,
  indicadores,
  onVoltar,
  extra,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-7 mb-8">
      <div className="flex items-center gap-4 shrink-0 rise">
        {onVoltar && (
          <button
            type="button"
            onClick={onVoltar}
            className="glass-icon w-11 h-11 shrink-0"
            title="Voltar para visão geral"
            aria-label="Voltar para visão geral"
          >
            <ArrowLeft className="w-4 h-4 text-bl-ink" />
          </button>
        )}
        <h1 className="font-display font-bold text-[28px] md:text-[34px] leading-[1.1] tracking-tight text-bl-ink">
          {linha1}
          <br />
          <span className="text-bl-ink/85">{linha2}</span>
        </h1>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-5 xl:max-w-3xl">
        {indicadores.map((item, i) => (
          <IndicadorItem key={item.legenda} item={item} delay={60 + i * 60} />
        ))}
      </div>

      {extra && <div className="shrink-0">{extra}</div>}
    </div>
  );
}
