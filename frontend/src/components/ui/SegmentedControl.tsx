interface Opcao<T extends string> {
  valor: T;
  rotulo: string;
  contagem?: number;
}

interface SegmentedControlProps<T extends string> {
  opcoes: Opcao<T>[];
  valor: T;
  onChange: (valor: T) => void;
}

// Seletor em pílulas (como o "Weighted / Total" da referência)
export function SegmentedControl<T extends string>({ opcoes, valor, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="glass-well rounded-full p-1 flex gap-1 overflow-x-auto">
      {opcoes.map((op) => {
        const ativo = op.valor === valor;
        return (
          <button
            key={op.valor}
            type="button"
            onClick={() => onChange(op.valor)}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${
              ativo ? 'bg-white text-bl-ink shadow-sm' : 'text-bl-muted hover:text-bl-ink'
            }`}
          >
            {op.rotulo}
            {op.contagem !== undefined && (
              <span className={`ml-1.5 ${ativo ? 'text-bl-blue font-bold' : 'opacity-70'}`}>{op.contagem}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

