import type { Cliente } from '../types';

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function iniciais(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// "2026-11-09" -> Date local (evita o deslocamento de fuso do new Date("AAAA-MM-DD"))
export function paraData(dataIso: string): Date {
  const [ano, mes, dia] = dataIso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function formatarData(dataIso: string): string {
  return paraData(dataIso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

export function formatarDataLonga(dataIso: string): string {
  return paraData(dataIso).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

export function diaDaSemana(dataIso: string): string {
  return paraData(dataIso).toLocaleDateString('pt-BR', { weekday: 'long' });
}

// Status exibido na tabela: Pendente, Confirmado ou Ajustado (analista mudou a sugestão)
export type StatusCliente = 'Pendente' | 'Confirmado' | 'Ajustado';

export function statusDoCliente(cliente: Cliente): StatusCliente {
  if (!cliente.status_confirmacao) return 'Pendente';

  const sugeridas = cliente.trilhas_sugeridas.map((t) => t.nome).sort().join('|');
  const confirmadas = [...cliente.trilhas_confirmadas].sort().join('|');
  return sugeridas === confirmadas ? 'Confirmado' : 'Ajustado';
}

// Explica o motivo em linguagem simples para quem não conhece o código.
// O texto técnico original (vindo do backend) continua sendo exibido junto.
export function motivoLegivel(trilha: string, cliente: Cliente): string {
  switch (trilha) {
    case 'Alto valor':
      return `Valor total de compras de ${formatarMoeda(cliente.valor_total_carrinhos)}, igual ou acima do limite de R$ 10.000,00.`;
    case 'Compra em quantidade':
      return `${cliente.quantidade_total_itens} itens comprados no total, igual ou acima do mínimo de 15 itens.`;
    case 'Incentivo':
      return `Valor total de compras de ${formatarMoeda(cliente.valor_total_carrinhos)}, abaixo de R$ 1.000,00.`;
    case 'Público jovem':
      return `Cliente com ${cliente.idade} anos, abaixo do limite de 30 anos.`;
    default:
      return 'O cliente não atendeu a nenhuma das regras anteriores.';
  }
}

