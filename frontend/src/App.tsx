import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Atmosphere } from './components/layout/Atmosphere';
import { TopBar } from './components/layout/TopBar';
import { ActionRail } from './components/layout/ActionRail';
import { CustomerDetailDrawer } from './components/ui/CustomerDetailDrawer';
import { Toasts, type ToastItem } from './components/ui/Toasts';
import { DashboardView } from './views/DashboardView';
import { ClientesView } from './views/ClientesView';
import { CronogramaView } from './views/CronogramaView';
import { SimulacaoView } from './views/SimulacaoView';
import {
  checkApiHealth,
  fetchClientes,
  fetchCronograma,
  fetchHistoricoEnvios,
  confirmarTrilhasCliente,
  simularEnviosHoje,
} from './services/api';
import type { Cliente, CronogramaItem, HistoricoSimulacao, TabType } from './types';

export function App() {
  const [abaAtiva, setAbaAtiva] = useState<TabType>('dashboard');
  const [filtroTrilhaNavegacao, setFiltroTrilhaNavegacao] = useState<string>('Todas');
  const [apiOnline, setApiOnline] = useState<boolean>(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cronograma, setCronograma] = useState<CronogramaItem[]>([]);
  const [historico, setHistorico] = useState<HistoricoSimulacao[]>([]);
  const [clienteEmFoco, setClienteEmFoco] = useState<Cliente | null>(null);
  const [clienteDrawer, setClienteDrawer] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const buscaInputRef = useRef<HTMLInputElement | null>(null);

  const notificar = useCallback((tipo: 'sucesso' | 'erro', texto: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((atual) => [...atual, { id, tipo, texto }]);
    setTimeout(() => {
      setToasts((atual) => atual.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const carregarDados = useCallback(async () => {
    setIsLoading(true);
    try {
      const online = await checkApiHealth();
      setApiOnline(online);

      if (online) {
        const [listaClientes, dadosCronograma, dadosHistorico] = await Promise.all([
          fetchClientes().catch(() => []),
          fetchCronograma().catch(() => ({
            total_envios: 0,
            total_clientes_confirmados: 0,
            itens: [],
          })),
          fetchHistoricoEnvios().catch(() => []),
        ]);

        setClientes(listaClientes);
        setCronograma(dadosCronograma.itens || []);
        setHistorico(dadosHistorico);

        setClienteEmFoco((atual) => {
          if (listaClientes.length === 0) return null;
          if (atual) {
            return listaClientes.find((c) => c.id === atual.id) ?? listaClientes[0];
          }
          // Prioriza automaticamente o cliente pendente de maior valor para apoiar a decisão do analista
          const maisRelevante = [...listaClientes].sort((a, b) => {
            if (a.status_confirmacao !== b.status_confirmacao) {
              return a.status_confirmacao ? 1 : -1;
            }
            return b.valor_total_carrinhos - a.valor_total_carrinhos;
          })[0];
          return maisRelevante ?? listaClientes[0];
        });
      }
    } catch {
      setApiOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
    const timer = setInterval(async () => {
      const online = await checkApiHealth();
      setApiOnline(online);
    }, 15000);
    return () => clearInterval(timer);
  }, [carregarDados]);

  const navegarPara = (aba: TabType, filtroTrilha?: string) => {
    if (filtroTrilha) {
      setFiltroTrilhaNavegacao(filtroTrilha);
    } else if (aba === 'clientes') {
      setFiltroTrilhaNavegacao('Todas');
    }
    setAbaAtiva(aba);
  };

  const handleConfirmarTrilhas = async (clienteId: number, trilhas: string[]) => {
    try {
      await confirmarTrilhasCliente(clienteId, trilhas);
      await carregarDados();
      notificar('sucesso', `Trilhas do cliente #${clienteId} confirmadas e salvas no SQLite.`);
    } catch (err: any) {
      notificar('erro', err?.message || 'Não foi possível salvar a confirmação.');
      throw err;
    }
  };

  const handleSimularHoje = async () => {
    setIsSimulating(true);
    try {
      const res = await simularEnviosHoje();
      const dadosHistorico = await fetchHistoricoEnvios().catch(() => []);
      setHistorico(dadosHistorico);
      notificar(
        'sucesso',
        `${res.total_simulados} envio(s) simulado(s) para o lote ${res.data_lote} e gravados no histórico.`
      );
      setAbaAtiva('historico');
    } catch (err: any) {
      notificar(
        'erro',
        err?.message || 'Confirme ao menos um cliente antes de simular envios.'
      );
    } finally {
      setIsSimulating(false);
    }
  };

  const handleBuscarRapido = () => {
    setAbaAtiva('clientes');
    setTimeout(() => {
      buscaInputRef.current?.focus();
    }, 120);
  };

  const pendentesCount = clientes.filter((c) => !c.status_confirmacao).length;

  return (
    <div className="min-h-screen relative p-3 sm:p-5 lg:p-7">
      {/* Camada 0: Atmosfera de fundo com blobs nas cores da BestLife */}
      <Atmosphere />

      {/* Camada 1: Moldura principal de vidro fosco flutuante (recua quando modal/drawer abre) */}
      <div className="app-shell relative z-10 max-w-[1540px] mx-auto glass-frame rounded-[36px] p-5 sm:p-7 lg:p-10 min-h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Barra superior estilo Salesforce */}
        <TopBar
          abaAtiva={abaAtiva}
          onSelecionarAba={(aba) => navegarPara(aba)}
          apiOnline={apiOnline}
          pendentes={pendentesCount}
          onRecarregar={carregarDados}
          carregando={isLoading}
        />

        {/* Aviso elegante caso a API FastAPI não esteja rodando */}
        {!apiOnline && !isLoading && (
          <div className="mt-5 glass-inset rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs border border-bl-yellow">
            <div className="flex items-center gap-2.5 text-bl-ink">
              <span className="w-8 h-8 rounded-full bg-bl-yellow flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-bl-ink" />
              </span>
              <span>
                <strong>Backend FastAPI desconectado.</strong> Inicie o servidor na raiz do projeto com{' '}
                <code className="px-2 py-0.5 rounded-md bg-white/80 font-mono text-[11px]">
                  .\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload
                </code>
              </span>
            </div>
            <button
              type="button"
              onClick={carregarDados}
              className="px-3.5 py-1.5 rounded-full bg-bl-ink text-white text-[11px] font-bold cursor-pointer"
            >
              Reconectar agora
            </button>
          </div>
        )}

        {/* Corpo com o Trilho Escuro Flutuante à esquerda + Área Principal */}
        <div className="flex-1 flex gap-5 lg:gap-7 mt-6 items-start">
          <ActionRail
            abaAtiva={abaAtiva}
            onSelecionarAba={(aba) => navegarPara(aba)}
            onBuscarCliente={handleBuscarRapido}
            onSimular={handleSimularHoje}
            simulando={isSimulating}
          />

          <main className="flex-1 min-w-0">
            {abaAtiva === 'dashboard' && (
              <DashboardView
                clientes={clientes}
                cronograma={cronograma}
                historico={historico}
                clienteEmFoco={clienteEmFoco}
                onSelecionarClienteFoco={setClienteEmFoco}
                onExpandirCliente={setClienteDrawer}
                onConfirmarTrilhas={handleConfirmarTrilhas}
                onNavigate={navegarPara}
                onQuickSimulate={handleSimularHoje}
                isSimulating={isSimulating}
              />
            )}

            {abaAtiva === 'clientes' && (
              <ClientesView
                clientes={clientes}
                isLoading={isLoading}
                filtroTrilhaInicial={filtroTrilhaNavegacao}
                clienteEmFoco={clienteEmFoco}
                onSelecionarClienteFoco={setClienteEmFoco}
                onExpandirCliente={setClienteDrawer}
                onConfirmarTrilhas={handleConfirmarTrilhas}
                onVoltarDashboard={() => navegarPara('dashboard')}
                buscaInputRef={buscaInputRef}
              />
            )}

            {abaAtiva === 'cronograma' && (
              <CronogramaView
                cronograma={cronograma}
                isLoading={isLoading}
                onNavigate={navegarPara}
              />
            )}

            {abaAtiva === 'historico' && (
              <SimulacaoView
                historico={historico}
                isLoading={isLoading}
                onSimularHoje={handleSimularHoje}
                isSimulating={isSimulating}
                onNavigate={navegarPara}
              />
            )}
          </main>
        </div>
      </div>

      {/* Camada 2: Drawer de detalhes do cliente com fundo desfocado */}
      <CustomerDetailDrawer
        cliente={clienteDrawer}
        onFechar={() => setClienteDrawer(null)}
        onConfirmarTrilhas={handleConfirmarTrilhas}
      />

      {/* Camada 3: Toasts flutuantes em vidro */}
      <Toasts
        itens={toasts}
        onFechar={(id) => setToasts((atual) => atual.filter((t) => t.id !== id))}
      />
    </div>
  );
}

export default App;
