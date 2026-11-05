import type { ComponentType } from 'react';
import { LayoutDashboard, Users, CalendarDays, History, Search, Send } from 'lucide-react';
import type { TabType } from '../../types';

interface ActionRailProps {
  abaAtiva: TabType;
  onSelecionarAba: (aba: TabType) => void;
  onBuscarCliente: () => void;
  onSimular: () => void;
  simulando: boolean;
}

interface ItemRail {
  rotulo: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  ativo?: boolean;
  destaque?: boolean;
}

// Trilho escuro flutuante à esquerda com z-index elevado para sobrepor os demais elementos
export function ActionRail({ abaAtiva, onSelecionarAba, onBuscarCliente, onSimular, simulando }: ActionRailProps) {
  const navegacao: ItemRail[] = [
    { rotulo: 'Visão Geral', icon: LayoutDashboard, onClick: () => onSelecionarAba('dashboard'), ativo: abaAtiva === 'dashboard' },
    { rotulo: 'Carteira de Clientes', icon: Users, onClick: () => onSelecionarAba('clientes'), ativo: abaAtiva === 'clientes' },
    { rotulo: 'Cronograma Semanal', icon: CalendarDays, onClick: () => onSelecionarAba('cronograma'), ativo: abaAtiva === 'cronograma' },
    { rotulo: 'Histórico de Envios', icon: History, onClick: () => onSelecionarAba('historico'), ativo: abaAtiva === 'historico' },
  ];

  const acoes: ItemRail[] = [
    { rotulo: 'Buscar cliente', icon: Search, onClick: onBuscarCliente },
    { rotulo: simulando ? 'Disparando…' : 'Simular envios de hoje', icon: Send, onClick: onSimular, destaque: true },
  ];

  const renderItem = (item: ItemRail) => {
    const Icon = item.icon;
    return (
      <div key={item.rotulo} className="relative group">
        <button
          type="button"
          onClick={item.onClick}
          aria-label={item.rotulo}
          className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
            item.destaque
              ? 'bg-bl-yellow text-bl-ink hover:scale-105'
              : item.ativo
              ? 'bg-white/15 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Icon className="w-[18px] h-[18px]" />
          {item.ativo && <span className="absolute -right-0.5 top-1.5 w-1.5 h-1.5 rounded-full bg-bl-yellow" />}
        </button>

        {/* Tooltip flutuante em vidro com z-50 para sempre sobrepor cabeçalhos e cards */}
        <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3.5 whitespace-nowrap glass-strong rounded-xl px-3.5 py-2 text-xs font-semibold text-bl-ink shadow-xl opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-50">
          {item.rotulo}
        </span>
      </div>
    );
  };

  return (
    <aside className="hidden md:block shrink-0 relative z-40">
      <div className="sticky top-6 rise" style={{ animationDelay: '120ms' }}>
        <div className="flex flex-col items-center gap-1.5 p-1.5 rounded-full bg-bl-ink/90 backdrop-blur-xl shadow-[0_24px_40px_-20px_rgb(15_30_70_/_0.6)] ring-1 ring-white/10">
          {navegacao.map(renderItem)}
          <span className="w-5 h-px bg-white/15 my-1" />
          {acoes.map(renderItem)}
        </div>
      </div>
    </aside>
  );
}
