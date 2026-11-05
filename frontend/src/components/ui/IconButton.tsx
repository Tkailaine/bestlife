import type { ReactNode } from 'react';

interface IconButtonProps {
  label: string; // usado no tooltip nativo e na acessibilidade
  onClick?: () => void;
  children: ReactNode;
  dark?: boolean;
  disabled?: boolean;
}

// Botão circular translúcido (inspirado nos botões "…" e "↗" da referência)
export function IconButton({ label, onClick, children, dark = false, disabled = false }: IconButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={
        dark
          ? 'inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-bl-ink shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-40'
          : 'glass-icon disabled:opacity-40 disabled:cursor-not-allowed'
      }
    >
      {children}
    </button>
  );
}

