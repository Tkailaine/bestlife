import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface OverlayProps {
  aberto: boolean;
  onFechar: () => void;
  variante?: 'drawer' | 'modal';
  children: ReactNode;
}

// Camada sobreposta: desfoca o fundo, recua o app e mostra um painel de vidro por cima
export function Overlay({ aberto, onFechar, variante = 'modal', children }: OverlayProps) {
  useEffect(() => {
    if (!aberto) return;

    // A classe no body faz o .app-shell "recuar" (ver index.css)
    document.body.classList.add('overlay-open');

    const fecharComEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
    };
    window.addEventListener('keydown', fecharComEsc);

    return () => {
      document.body.classList.remove('overlay-open');
      window.removeEventListener('keydown', fecharComEsc);
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Fundo desfocado */}
      <div
        className="absolute inset-0 bg-[#1B2440]/20 backdrop-blur-md fade-in"
        onClick={onFechar}
      />

      {variante === 'drawer' ? (
        <aside
          role="dialog"
          aria-modal="true"
          className="absolute top-3 bottom-3 right-3 w-[calc(100%-24px)] sm:w-[540px] glass-strong rounded-[32px] overflow-hidden flex flex-col drawer-in"
        >
          {children}
        </aside>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <div
            role="dialog"
            aria-modal="true"
            className="pointer-events-auto w-full max-w-2xl max-h-[90vh] glass-strong rounded-[32px] overflow-hidden flex flex-col pop-in"
          >
            {children}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

