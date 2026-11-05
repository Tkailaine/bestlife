import { iniciais } from '../../utils/format';

// Cores derivadas da identidade BestLife para os avatares de iniciais
const PALETA = [
  'bg-bl-blue text-white',
  'bg-bl-steel text-white',
  'bg-bl-ink text-white',
  'bg-bl-yellow text-bl-ink',
  'bg-white/80 text-bl-blue',
];

function corPorNome(nome: string): string {
  let soma = 0;
  for (const letra of nome) soma += letra.charCodeAt(0);
  return PALETA[soma % PALETA.length];
}

const TAMANHOS = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-[11px]',
  lg: 'w-20 h-20 text-xl',
};

interface AvatarProps {
  nome: string;
  size?: keyof typeof TAMANHOS;
  className?: string;
}

export function Avatar({ nome, size = 'md', className = '' }: AvatarProps) {
  return (
    <div
      className={`rounded-full font-bold flex items-center justify-center shrink-0 ${TAMANHOS[size]} ${corPorNome(nome)} ${className}`}
      title={nome}
    >
      {iniciais(nome)}
    </div>
  );
}

// Pilha de avatares sobrepostos (como na referência)
export function AvatarStack({ nomes, max = 3 }: { nomes: string[]; max?: number }) {
  const visiveis = nomes.slice(0, max);
  const restante = nomes.length - visiveis.length;

  return (
    <div className="flex items-center">
      {visiveis.map((nome, i) => (
        <Avatar key={nome + i} nome={nome} size="sm" className={`ring-2 ring-white/80 ${i > 0 ? '-ml-2' : ''}`} />
      ))}
      {restante > 0 && (
        <div className="-ml-2 w-7 h-7 rounded-full bg-white/85 ring-2 ring-white/80 text-[10px] font-bold text-bl-ink flex items-center justify-center">
          +{restante}
        </div>
      )}
    </div>
  );
}

