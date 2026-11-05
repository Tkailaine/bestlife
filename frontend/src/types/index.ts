// Abas de navegação da interface
export type TabType = 'dashboard' | 'clientes' | 'cronograma' | 'historico';

export interface TrilhaSugerida {
  nome: string;
  motivo: string;
}

export interface Cliente {
  id: number;
  nome_completo: string;
  idade: number;
  sexo: string;
  estado: string;
  telefone: string;
  valor_total_carrinhos: number;
  quantidade_total_itens: number;
  trilhas_sugeridas: TrilhaSugerida[];
  trilhas_confirmadas: string[];
  status_confirmacao: boolean;
}

export interface CronogramaItem {
  cliente_id: number;
  nome_cliente: string;
  primeiro_nome: string;
  telefone: string;
  trilha: string;
  numero_mensagem: number;
  semana_relativa: number;
  data_envio: string;
  mensagem: string;
}

export interface RequisicaoSetabot {
  plataforma: string;
  metodo: string;
  url: string;
  headers: Record<string, string>;
  body: {
    phone: string;
    message: string;
  };
}

export interface HistoricoSimulacao {
  id: number;
  cliente_id: number;
  nome_cliente: string;
  telefone: string;
  trilha: string;
  mensagem: string;
  data_envio: string;
  criado_em: string;
  requisicao_simulada: RequisicaoSetabot;
}

