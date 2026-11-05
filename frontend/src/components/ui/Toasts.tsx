import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface ToastItem {
  id: number;
  tipo: 'sucesso' | 'erro';
  texto: string;
}

interface ToastsProps {
  itens: ToastItem[];
  onFechar: (id: number) => void;
}

// Notificações flutuantes no canto superior direito
export function Toasts({ itens, onFechar }: ToastsProps) {
  return (
    <div className="fixed top-5 right-5 z-[60] flex flex-col gap-2 w-[min(380px,calc(100%-40px))]">
      {itens.map((t) => (
        <div key={t.id} className="glass-strong rounded-2xl p-3.5 flex items-start gap-3 toast-in">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              t.tipo === 'sucesso' ? 'bg-bl-blue text-white' : 'bg-bl-yellow text-bl-ink'
            }`}
          >
            {t.tipo === 'sucesso' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <p className="flex-1 text-xs text-bl-ink leading-relaxed pt-1.5">{t.texto}</p>
          <button
            onClick={() => onFechar(t.id)}
            className="text-bl-muted hover:text-bl-ink cursor-pointer pt-1"
            aria-label="Fechar notificação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

