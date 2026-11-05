import { Check } from 'lucide-react';
import { visualDaTrilha } from '../../constants/trilhas';
import type { StatusCliente } from '../../utils/format';

interface TrilhaBadgeProps {
  nome: string;
  confirmada?: boolean;
}

// Chip discreto de trilha: ponto colorido + nome
export function TrilhaBadge({ nome, confirmada = false }: TrilhaBadgeProps) {
  const visual = visualDaTrilha(nome);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full glass-inset px-2.5 py-1 text-[11px] font-medium text-bl-ink whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: visual.dot }} />
      {nome}
      {confirmada && <Check className="w-3 h-3 text-bl-blue" strokeWidth={3} />}
    </span>
  );
}

const estilosStatus: Record<StatusCliente, string> = {
  Pendente: 'bg-bl-yellow text-bl-ink',
  Confirmado: 'bg-bl-blue text-white',
  Ajustado: 'bg-bl-ink text-white',
};

export function StatusBadge({ status }: { status: StatusCliente }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${estilosStatus[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

