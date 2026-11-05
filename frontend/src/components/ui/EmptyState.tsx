import type { ComponentType, ReactNode } from 'react';

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>;
  titulo: string;
  texto: ReactNode;
  acao?: ReactNode;
}

export function EmptyState({ icon: Icon, titulo, texto, acao }: EmptyStateProps) {
  return (
    <div className="glass-well rounded-3xl px-6 py-9 text-center flex flex-col items-center">
      <div className="glass-icon w-12 h-12 cursor-default mb-3">
        <Icon className="w-5 h-5 text-bl-muted" />
      </div>
      <p className="text-sm font-semibold text-bl-ink">{titulo}</p>
      <p className="text-xs text-bl-muted mt-1 max-w-sm leading-relaxed">{texto}</p>
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}
