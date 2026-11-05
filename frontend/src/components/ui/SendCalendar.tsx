import { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import type { CronogramaItem } from '../../types';
import { visualDaTrilha } from '../../constants/trilhas';
import { paraData } from '../../utils/format';
import { Avatar } from './Avatar';

interface SendCalendarProps {
  itens: CronogramaItem[];
  dataSelecionada?: string | null;
  onSelecionarData?: (data: string | null) => void;
  onExpandir?: () => void;
}

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function chaveDaData(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

// Calendário inspirado no bloco "Tasks Schedule" da referência Salesforce:
// blocos coloridos nos dias com disparo + mini avatares dos clientes no topo da célula
export function SendCalendar({
  itens,
  dataSelecionada = null,
  onSelecionarData,
  onExpandir,
}: SendCalendarProps) {
  const inicial = itens.length > 0 ? paraData(itens[0].data_envio) : new Date();
  const [mesVisivel, setMesVisivel] = useState(
    new Date(inicial.getFullYear(), inicial.getMonth(), 1)
  );

  // Agrupa os envios por data ISO (AAAA-MM-DD)
  const enviosPorDia: Record<string, CronogramaItem[]> = {};
  for (const item of itens) {
    if (!enviosPorDia[item.data_envio]) enviosPorDia[item.data_envio] = [];
    enviosPorDia[item.data_envio].push(item);
  }

  const ano = mesVisivel.getFullYear();
  const mes = mesVisivel.getMonth();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const deslocamento = (new Date(ano, mes, 1).getDay() + 6) % 7;
  const hoje = chaveDaData(new Date());

  const celulas: Array<Date | null> = [];
  for (let i = 0; i < deslocamento; i++) celulas.push(null);
  for (let d = 1; d <= diasNoMes; d++) celulas.push(new Date(ano, mes, d));

  const nomeDoMes = mesVisivel.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div>
      {/* Navegação mensal estilo "Tasks Schedule" */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5">
          <button
            type="button"
            className="glass-icon w-8 h-8"
            aria-label="Mês anterior"
            onClick={() => setMesVisivel(new Date(ano, mes - 1, 1))}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="glass-icon w-8 h-8"
            aria-label="Próximo mês"
            onClick={() => setMesVisivel(new Date(ano, mes + 1, 1))}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="text-sm font-semibold capitalize text-bl-ink">
          {nomeDoMes}
        </span>

        {onExpandir ? (
          <button
            type="button"
            onClick={onExpandir}
            className="glass-icon w-8 h-8"
            title="Ver cronograma completo"
            aria-label="Ver cronograma completo"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="w-8" />
        )}
      </div>

      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 gap-1.5 text-center mb-1">
        {DIAS.map((d) => (
          <span key={d} className="text-[10px] font-semibold text-bl-muted pb-1">
            {d}
          </span>
        ))}
      </div>

      {/* Grade de células */}
      <div className="grid grid-cols-7 gap-1.5">
        {celulas.map((data, i) => {
          if (!data) return <span key={`vazio-${i}`} className="h-14" />;

          const chave = chaveDaData(data);
          const envios = enviosPorDia[chave] ?? [];
          const temEnvio = envios.length > 0;
          const visual = temEnvio ? visualDaTrilha(envios[0].trilha) : null;
          const selecionado = dataSelecionada === chave;

          return (
            <button
              key={chave}
              type="button"
              disabled={!temEnvio}
              onClick={() => onSelecionarData?.(selecionado ? null : chave)}
              title={
                temEnvio
                  ? `${envios.length} envio(s) em ${chave} • ${envios[0].trilha}`
                  : undefined
              }
              className={`relative h-14 rounded-2xl p-1.5 flex flex-col justify-between items-start text-left transition-all duration-300 ${
                temEnvio && visual
                  ? `${visual.tile} ${visual.tileText} font-bold cursor-pointer hover:-translate-y-0.5`
                  : 'glass-well text-bl-muted hover:bg-white/40'
              } ${
                selecionado
                  ? 'ring-2 ring-offset-2 ring-offset-transparent ring-bl-ink scale-[1.03]'
                  : ''
              } ${
                chave === hoje && !temEnvio
                  ? 'ring-1 ring-bl-blue/60 text-bl-blue font-semibold'
                  : ''
              }`}
            >
              {/* Avatares no topo da célula (como na referência Salesforce) */}
              {temEnvio ? (
                <div className="flex items-center -space-x-1.5">
                  {envios.slice(0, 2).map((env, idx) => (
                    <Avatar
                      key={env.cliente_id + '-' + idx}
                      nome={env.nome_cliente}
                      size="sm"
                      className="w-4 h-4 text-[7px] ring-1 ring-white/90"
                    />
                  ))}
                </div>
              ) : (
                <span />
              )}

              <div className="w-full flex items-center justify-between text-[11px] leading-none">
                <span>{data.getDate()}</span>
                {temEnvio && (
                  <span className="text-[9px] opacity-80">{envios.length}×</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
