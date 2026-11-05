import type { Cliente } from '../types';
import { formatarMoeda } from './format';

export interface DiagnosticoCliente {
  selo: string;
  tom: 'critico' | 'oportunidade' | 'estavel';
  resumoDecisao: string;
  semanasJornada: number;
  primeiraTrilha: string;
}

// Gera um diagnóstico executivo claro para apoiar a decisão do analista sobre um cliente
export function diagnosticarCliente(cliente: Cliente): DiagnosticoCliente {
  const trilhasAtuais =
    cliente.status_confirmacao && cliente.trilhas_confirmadas.length > 0
      ? cliente.trilhas_confirmadas
      : cliente.trilhas_sugeridas.map((t) => t.nome);

  const semanasJornada = Math.max(trilhasAtuais.length, 1) * 3;
  const primeiraTrilha = trilhasAtuais[0] ?? 'Geral';

  const ehVip = cliente.valor_total_carrinhos >= 10000;
  const quaseVip =
    cliente.valor_total_carrinhos >= 7500 && cliente.valor_total_carrinhos < 10000;
  const quaseVolume =
    cliente.quantidade_total_itens >= 12 && cliente.quantidade_total_itens < 15;

  if (!cliente.status_confirmacao && ehVip) {
    return {
      selo: 'Aprovação Prioritária · VIP',
      tom: 'critico',
      resumoDecisao: `Ticket de ${formatarMoeda(cliente.valor_total_carrinhos)} aguarda liberação. Confirmar agora garante entrada imediata na trilha Alto Valor.`,
      semanasJornada,
      primeiraTrilha,
    };
  }

  if (quaseVip) {
    const falta = 10000 - cliente.valor_total_carrinhos;
    return {
      selo: 'Potencial de Upgrade VIP',
      tom: 'oportunidade',
      resumoDecisao: `Está a apenas ${formatarMoeda(falta)} do corte de R$ 10.000. Vale avaliar inclusão manual em Alto Valor ou manter régua de estímulo.`,
      semanasJornada,
      primeiraTrilha,
    };
  }

  if (quaseVolume) {
    const faltaItens = 15 - cliente.quantidade_total_itens;
    return {
      selo: 'Próximo de Compra em Volume',
      tom: 'oportunidade',
      resumoDecisao: `Acumulou ${cliente.quantidade_total_itens} itens (faltam ${faltaItens} para a regra ≥ 15). Potencial candidato para desconto de cesta recorrente.`,
      semanasJornada,
      primeiraTrilha,
    };
  }

  if (trilhasAtuais.length >= 2) {
    return {
      selo: `Jornada Combinada · ${semanasJornada} semanas`,
      tom: 'estavel',
      resumoDecisao: `Qualificado em ${trilhasAtuais.length} trilhas. Receberá 3 semanas de "${primeiraTrilha}" antes de iniciar "${trilhasAtuais[1]}".`,
      semanasJornada,
      primeiraTrilha,
    };
  }

  return {
    selo: 'Classificação Direta',
    tom: 'estavel',
    resumoDecisao: `Perfil 100% aderente à trilha "${primeiraTrilha}" (${semanasJornada} semanas de comunicação). Sem conflito de regras.`,
    semanasJornada,
    primeiraTrilha,
  };
}

export interface ResumoInteligenciaOperacao {
  valorRetidoPendentes: number;
  vipPendentes: Cliente[];
  filaMaiorImpacto: Cliente[];
  clientesMultiTrilha: number;
  proximoClienteSugerido: Cliente | null;
}

// Consolida indicadores de tomada de decisão para orientar o trabalho diário do analista
export function calcularInteligenciaOperacao(
  clientes: Cliente[]
): ResumoInteligenciaOperacao {
  const pendentes = clientes.filter((c) => !c.status_confirmacao);

  const valorRetidoPendentes = pendentes.reduce(
    (acc, c) => acc + c.valor_total_carrinhos,
    0
  );

  const vipPendentes = pendentes
    .filter((c) => c.valor_total_carrinhos >= 10000)
    .sort((a, b) => b.valor_total_carrinhos - a.valor_total_carrinhos);

  const filaMaiorImpacto = [...pendentes]
    .sort((a, b) => b.valor_total_carrinhos - a.valor_total_carrinhos)
    .slice(0, 5);

  const clientesMultiTrilha = clientes.filter(
    (c) => c.trilhas_sugeridas.length >= 2
  ).length;

  return {
    valorRetidoPendentes,
    vipPendentes,
    filaMaiorImpacto,
    clientesMultiTrilha,
    proximoClienteSugerido: filaMaiorImpacto[0] ?? clientes[0] ?? null,
  };
}

