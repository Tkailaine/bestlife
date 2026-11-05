// Configuração visual das trilhas inspirada na referência estrutural do Salesforce
// mantendo 100% as regras de negócio do backend (services/trilhas.py).

export const ORDEM_TRILHAS = [
  'Alto valor',
  'Compra em quantidade',
  'Incentivo',
  'Público jovem',
  'Geral',
] as const;

export interface TrilhaVisual {
  prioridade: number;
  subtitulo: string;
  regra: string;
  tile: string;
  tileText: string;
  tileSubtext: string;
  dot: string;
  destaqueSeta?: boolean;
}

export const TRILHAS: Record<string, TrilhaVisual> = {
  'Alto valor': {
    prioridade: 1,
    subtitulo: 'Frete grátis e curadoria exclusiva',
    regra: 'Valor total ≥ R$ 10.000',
    tile: 'bg-[#264DA4] shadow-[0_22px_38px_-20px_rgba(38,77,164,0.75)]',
    tileText: 'text-white',
    tileSubtext: 'text-white/75',
    dot: '#264DA4',
  },
  'Público jovem': {
    prioridade: 4,
    subtitulo: 'Lançamentos e indicação premiada',
    regra: 'Idade < 30 anos',
    tile: 'bg-[#488296] shadow-[0_22px_38px_-20px_rgba(72,130,150,0.7)]',
    tileText: 'text-white',
    tileSubtext: 'text-white/75',
    dot: '#488296',
  },
  'Compra em quantidade': {
    prioridade: 2,
    subtitulo: 'Desconto progressivo e recorrência',
    regra: 'Itens ≥ 15',
    tile: 'bg-[#0D0E11] shadow-[0_24px_42px_-20px_rgba(13,14,17,0.75)]',
    tileText: 'text-white',
    tileSubtext: 'text-white/70',
    dot: '#0D0E11',
    destaqueSeta: true,
  },
  Incentivo: {
    prioridade: 3,
    subtitulo: 'Cupom BEMVINDO 15% e ofertas rápidas',
    regra: 'Valor total < R$ 1.000',
    tile: 'bg-[#F8BF29] shadow-[0_22px_38px_-20px_rgba(248,191,41,0.65)]',
    tileText: 'text-[#1E1F22]',
    tileSubtext: 'text-[#1E1F22]/75',
    dot: '#F8BF29',
  },
  Geral: {
    prioridade: 5,
    subtitulo: 'Novidades semanais e pós-venda',
    regra: 'Não se encaixou nas anteriores',
    tile: 'bg-white/68 border border-white/85 shadow-[0_18px_34px_-22px_rgba(24,46,98,0.18)]',
    tileText: 'text-[#1E1F22]',
    tileSubtext: 'text-[#737373]',
    dot: '#737373',
  },
};

export function visualDaTrilha(nome: string): TrilhaVisual {
  return TRILHAS[nome] ?? TRILHAS['Geral'];
}
