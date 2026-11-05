import type { Cliente, CronogramaItem, HistoricoSimulacao } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchClientes(trilha?: string): Promise<Cliente[]> {
  const url = new URL(`${API_BASE_URL}/clientes`);
  if (trilha && trilha !== 'Todas') {
    url.searchParams.set('trilha', trilha);
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Falha ao carregar lista de clientes');
  return res.json();
}

export async function fetchClienteById(id: number): Promise<Cliente> {
  const res = await fetch(`${API_BASE_URL}/clientes/${id}`);
  if (!res.ok) throw new Error(`Falha ao carregar cliente ${id}`);
  return res.json();
}

export async function confirmarTrilhasCliente(
  id: number,
  trilhas: string[],
  dia_semana_envio?: number | null
): Promise<{
  mensagem: string;
  status_confirmacao: boolean;
  dia_semana_envio?: number | null;
}> {
  const res = await fetch(`${API_BASE_URL}/clientes/${id}/confirmar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      trilhas,
      dia_semana_envio: dia_semana_envio === undefined ? null : dia_semana_envio,
    }),
  });
  if (!res.ok) throw new Error('Erro ao confirmar trilhas');
  return res.json();
}

export async function fetchCronograma(): Promise<{
  total_envios: number;
  total_clientes_confirmados: number;
  dia_semana_padrao?: number;
  itens: CronogramaItem[];
}> {
  const res = await fetch(`${API_BASE_URL}/cronograma`);
  if (!res.ok) throw new Error('Falha ao carregar cronograma');
  return res.json();
}

export async function salvarDiaSemanaPadrao(
  dia_semana_padrao: number
): Promise<{ mensagem: string; dia_semana_padrao: number }> {
  const res = await fetch(`${API_BASE_URL}/cronograma/configurar-dia`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dia_semana_padrao }),
  });
  if (!res.ok) throw new Error('Erro ao salvar dia da semana padrão');
  return res.json();
}

export async function simularEnviosHoje(): Promise<{
  mensagem: string;
  total_simulados: number;
  data_lote: string;
  disparos_simulados: Array<{
    cliente: string;
    telefone: string;
    mensagem: string;
    requisicao: any;
  }>;
}> {
  const res = await fetch(`${API_BASE_URL}/simulacao/disparar-hoje`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Erro ao simular envios');
  }
  return res.json();
}

export async function fetchHistoricoEnvios(): Promise<HistoricoSimulacao[]> {
  const res = await fetch(`${API_BASE_URL}/simulacao/historico`);
  if (!res.ok) throw new Error('Falha ao carregar histórico');
  return res.json();
}
