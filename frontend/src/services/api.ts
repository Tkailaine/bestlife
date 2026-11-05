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
  trilhas: string[]
): Promise<{ mensagem: string; status_confirmacao: boolean }> {
  const res = await fetch(`${API_BASE_URL}/clientes/${id}/confirmar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trilhas }),
  });
  if (!res.ok) throw new Error('Erro ao confirmar trilhas');
  return res.json();
}

export async function fetchCronograma(): Promise<{
  total_envios: number;
  total_clientes_confirmados: number;
  itens: CronogramaItem[];
}> {
  const res = await fetch(`${API_BASE_URL}/cronograma`);
  if (!res.ok) throw new Error('Falha ao carregar cronograma');
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
