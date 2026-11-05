import type { CSSProperties, ReactNode } from 'react';

interface PanelProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Container de vidro fosco espaçoso e com leitura leve
export function Panel({
  title,
  subtitle,
  actions,
  children,
  className = '',
  delay = 0,
}: PanelProps) {
  return (
    <section
      className={`glass rounded-[30px] p-6 lg:p-7 rise ${className}`}
      style={{ '--d': `${delay}ms` } as CSSProperties}
    >
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            {title && (
              <h3 className="text-[15px] font-bold tracking-tight text-bl-ink">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-bl-muted mt-0.5 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
