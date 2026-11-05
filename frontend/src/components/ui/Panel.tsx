import type { CSSProperties, ReactNode } from 'react';

interface PanelProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number; // atraso da animação de entrada (ms)
}

// Container de vidro fosco usado em todas as telas
export function Panel({ title, subtitle, actions, children, className = '', delay = 0 }: PanelProps) {
  return (
    <section
      className={`glass rounded-[28px] p-5 rise ${className}`}
      style={{ '--d': `${delay}ms` } as CSSProperties}
    >
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            {title && <h3 className="text-[13px] font-semibold text-bl-ink">{title}</h3>}
            {subtitle && <p className="text-[11px] text-bl-muted mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

