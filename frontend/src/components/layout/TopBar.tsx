import { RefreshCw } from 'lucide-react';
import logoBestLife from '../../assets/logoBestLife.png';
import type { TabType } from '../../types';

interface TopBarProps {
  abaAtiva: TabType;
  onSelecionarAba: (aba: TabType) => void;
  apiOnline: boolean;
  pendentes: number;
  onRecarregar: () => void;
  carregando: boolean;
}

const ABAS: Array<{ id: TabType; rotulo: string }> = [
  { id: 'dashboard', rotulo: 'Dashboard' },
  { id: 'clientes', rotulo: 'Clientes' },
  { id: 'cronograma', rotulo: 'Cronograma' },
  { id: 'historico', rotulo: 'Histórico' },
];

export function TopBar({ abaAtiva, onSelecionarAba, apiOnline, pendentes, onRecarregar, carregando }: TopBarProps) {
  return (
    <header className="flex items-center gap-3 md:gap-4 rise">
      {/* Marca: o logo é branco, então fica sobre um bloco no azul institucional */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="h-11 px-3.5 rounded-2xl bg-bl-blue flex items-center shadow-[0_12px_24px_-12px_rgb(38_77_164_/_0.9)]">
          <img src={logoBestLife} alt="BestLife" className="h-7 w-auto" />
        </div>
        <div className="hidden sm:block leading-tight">
          <div className="font-display text-[13px] font-semibold tracking-tight text-bl-ink">CRM</div>
          <div className="text-[11px] text-bl-muted">Mensageria</div>
        </div>
      </div>

      {/* Navegação principal em pílulas */}
      <nav className="flex-1 flex justify-center min-w-0">
        <div className="glass-well rounded-full p-1 flex gap-1 overflow-x-auto max-w-full">
          {ABAS.map((aba) => {
            const ativa = abaAtiva === aba.id;
            return (
              <button
                key={aba.id}
                type="button"
                onClick={() => onSelecionarAba(aba.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                  ativa ? 'bg-bl-ink text-white shadow-md' : 'text-bl-ink/70 hover:text-bl-ink hover:bg-white/60'
                }`}
              >
                {aba.rotulo}
                {aba.id === 'clientes' && pendentes > 0 && (
                  <span className="text-[10px] font-bold rounded-full px-1.5 py-px bg-bl-yellow text-bl-ink">
                    {pendentes}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Ações rápidas e status */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden lg:flex items-center gap-2 glass-inset rounded-full pl-2.5 pr-3 h-9 text-[11px] text-bl-ink">
          <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500 pulse-dot' : 'bg-red-500'}`} />
          {apiOnline ? 'API conectada' : 'API offline'}
        </div>
        <button type="button" className="glass-icon" onClick={onRecarregar} title="Recarregar dados" aria-label="Recarregar dados">
          <RefreshCw className={`w-4 h-4 ${carregando ? 'animate-spin' : ''}`} />
        </button>
        <div
          className="w-9 h-9 rounded-full bg-gradient-to-br from-bl-blue to-bl-steel text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white/80"
          title="Analista de CRM"
        >
          AN
        </div>
      </div>
    </header>
  );
}

