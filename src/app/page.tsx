'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Loader, Timer, AlertCircle, Clock, CheckCircle, BarChart2, Users, TrendingUp, Target } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface Signal {
  asset: string;
  entryTime: string;
  entryTimestamp: number; // Entry time in milliseconds
  expiration: string;
  analysis: 'Compra' | 'Venda';
  protection1: string;
  volatility: string;
  endTime: number; // End time in milliseconds
  assertiveness: number;
}

const ASSETS = ['EUR/USD', 'GBP/JPY', 'AUD/CAD', 'USD/JPY', 'EUR/GBP OTC', 'AUD/USD OTC'];
const EXPIRATIONS = ['1 minuto', '5 minutos'];
const VOLATILITY = ['Baixa', 'Média', 'Alta'];
const LOADING_MESSAGES = [
    "Indicador está buscando entrada...",
    "Analisando o mercado...",
    "Buscando as melhores oportunidades...",
    "Verificando volatilidade...",
    "Finalizando análise técnica...",
    "Localizando próximo sinal...",
];
const COOLDOWN_SECONDS = 15;
const LOADING_DURATION = Math.random() * 4000 + 3000; // Simula entre 3 a 7 segundos

// Função para formatar a hora com dois dígitos
const formatTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function Home() {
  const [signal, setSignal] = useState<Signal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [progress, setProgress] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(COOLDOWN_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [winningUsers, setWinningUsers] = useState<number | null>(null);

  useEffect(() => {
    // Initial random numbers for social proof
    setActiveUsers(Math.floor(Math.random() * (180 - 120 + 1)) + 120);
    setWinningUsers(Math.floor(Math.random() * (95 - 75 + 1)) + 75);

    // Update numbers periodically to make it look dynamic
    const interval = setInterval(() => {
        setActiveUsers(prev => (prev ? prev + (Math.floor(Math.random() * 5) - 2) : null));
        setWinningUsers(prev => (prev ? prev + (Math.floor(Math.random() * 3) - 1) : null));
    }, 3000); // update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let messageInterval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (isLoading) {
      setProgress(0);
      setLoadingMessage(LOADING_MESSAGES[0]);

      messageInterval = setInterval(() => {
        setLoadingMessage(prevMessage => {
            const currentIndex = LOADING_MESSAGES.indexOf(prevMessage);
            const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
            return LOADING_MESSAGES[nextIndex];
        });
      }, 1500);

      const progressIncrement = 100 / (LOADING_DURATION / 100);
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + progressIncrement;
        });
      }, 100);

    }
    return () => {
        clearInterval(messageInterval);
        clearInterval(progressInterval);
    };
  }, [isLoading]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCooldown && cooldownTime > 0) {
      timer = setTimeout(() => {
        setCooldownTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (isCooldown && cooldownTime === 0) {
      setIsCooldown(false);
      setCooldownTime(COOLDOWN_SECONDS);
    }
    return () => clearTimeout(timer);
  }, [isCooldown, cooldownTime]);


  const startCooldown = () => {
    setIsCooldown(true);
  };

  const handleGenerateSignal = () => {
    if (!selectedAsset) {
        setError("Por favor, selecione um par de moedas para continuar.");
        return;
    }
    
    setIsLoading(true);
    setSignal(null);
    setError(null); 

    setTimeout(() => {
      // Simula uma chance de falha
      const shouldFail = Math.random() < 0.2; // 20% de chance de falha

      if (shouldFail) {
        setError("Nenhuma oportunidade clara foi encontrada. Tente novamente.");
        setSignal(null);
      } else {
        const randomExpiration = EXPIRATIONS[Math.floor(Math.random() * EXPIRATIONS.length)];
        const randomAnalysis = Math.random() > 0.5 ? 'Compra' : 'Venda';
        const randomVolatility = VOLATILITY[Math.floor(Math.random() * VOLATILITY.length)];
        const expirationMinutes = parseInt(randomExpiration.split(' ')[0]);

        const now = new Date();
        let entryTime = new Date(now.getTime() + 1 * 60 * 1000); // Default to 1 minute from now

        if (expirationMinutes === 5) {
          const minutes = now.getMinutes();
          const nextFive = Math.ceil((minutes + 1) / 5) * 5; // +1 to ensure it's in the future
          entryTime = new Date(now);
          entryTime.setMinutes(nextFive);
          entryTime.setSeconds(0, 0);

          // If calculated time is in the past, add 5 minutes
          if (entryTime.getTime() <= now.getTime()) {
              entryTime.setMinutes(entryTime.getMinutes() + 5);
          }
        }
        
        const endTime = new Date(entryTime.getTime() + expirationMinutes * 60 * 1000);
        const protection1 = new Date(entryTime.getTime() + 1 * 60 * 1000); 

        setSignal({
          asset: selectedAsset,
          entryTime: formatTime(entryTime),
          entryTimestamp: entryTime.getTime(),
          expiration: randomExpiration,
          analysis: randomAnalysis,
          protection1: formatTime(protection1),
          volatility: randomVolatility,
          endTime: endTime.getTime(),
          assertiveness: Math.floor(Math.random() * (96 - 69 + 1)) + 69,
        });
      }
      setIsLoading(false);
      setProgress(100);
      startCooldown();
    }, LOADING_DURATION);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-900 p-4 text-white">
      <div className="w-full max-w-sm">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <Loader size={64} className="mb-4 text-primary animate-spin" />
              <h1 className="text-2xl font-bold mb-2">{loadingMessage}</h1>
              <p className="text-gray-400 mb-4">Inteligência artificial gerando melhor ponto de entrada na corretora Avalon Broker.</p>
              <Progress value={progress} className="w-full" />
            </div>
        ) : signal ? (
          <Card className="animate-fade-in-down w-full border-2 border-primary bg-gray-900 shadow-lg shadow-primary/30">
            <CardHeader className="items-center pb-4 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight text-primary">
                ENTRADA CONFIRMADA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg">
              <SignalInfo label="Ativo:" value={signal.asset} />
               <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                <span className="font-medium text-gray-400">Volatilidade:</span>
                 <div className="flex items-center gap-2">
                    <BarChart2 size={20} className="text-primary"/>
                    <span className="font-bold text-white">{signal.volatility}</span>
                 </div>
              </div>
               <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                <span className="font-medium text-gray-400">Assertividade:</span>
                 <div className="flex items-center gap-2">
                    <Target size={20} className="text-primary"/>
                    <span className={`font-bold ${signal.assertiveness < 75 ? 'text-red-500' : 'text-green-500'}`}>{signal.assertiveness}%</span>
                 </div>
              </div>
              <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                <span className="font-medium text-gray-400">Entrada às:</span>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-white">{signal.entryTime}</span>
                  <span className="text-xs text-gray-400">Entrar exatamente no horário</span>
                </div>
              </div>
              <SignalInfo label="Expiração:" value={signal.expiration} />
              <SignalInfo label="Análise:" value={signal.analysis} isAnalysis={true} analysisType={signal.analysis} />
              <SignalInfo label="Proteção 1:" value={signal.protection1} isTime={true}/>
              <CountdownTimer entryTimestamp={signal.entryTimestamp} endTime={signal.endTime} />
            </CardContent>
          </Card>
        ) : (
           <div className="flex flex-col items-center justify-center text-center w-full">
              <Flame size={64} className="mb-4 text-primary" />
              <h1 className="text-3xl font-bold mb-2">Gerador de Sinais</h1>
              <p className="text-gray-400 mt-2 px-4 mb-6">Selecione o ativo e clique no botão para gerar um sinal para a corretora Avalon Broker.</p>
               <div className="flex justify-around w-full mb-6 text-sm">
                <div className="flex items-center gap-2">
                    <Users size={20} className="text-primary" />
                    <div>
                        <p className="font-bold">{activeUsers ?? '---'}</p>
                        <p className="text-gray-400">Usuários ativos</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-500" />
                     <div>
                        <p className="font-bold">{winningUsers ?? '--'}%</p>
                        <p className="text-gray-400">Ganhando agora</p>
                    </div>
                </div>
              </div>
               <Select onValueChange={setSelectedAsset} value={selectedAsset || ''}>
                <SelectTrigger className="w-full mb-4">
                  <SelectValue placeholder="Selecione um par de moedas" />
                </SelectTrigger>
                <SelectContent>
                  {ASSETS.map(asset => (
                    <SelectItem key={asset} value={asset}>{asset}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
               {error && (
                <div className="flex flex-col items-center justify-center text-center p-4 my-4 text-red-400 animate-fade-in-down bg-red-900/20 rounded-lg">
                    <AlertCircle size={40} className="mb-2" />
                    <h2 className="text-lg font-bold mb-1">Falha ao Gerar Sinal</h2>
                    <p className="text-gray-300 text-sm">{error}</p>
                </div>
              )}
            </div>
        )}

        <Button
          onClick={handleGenerateSignal}
          disabled={isLoading || isCooldown || (!signal && !error && !selectedAsset)}
          size="lg"
          className="mt-8 w-full rounded-full bg-primary py-8 text-xl font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/50 transition-transform duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
           {isLoading ? (
            <>
              <Loader className="mr-2 h-6 w-6 animate-spin" />
              Buscando...
            </>
          ) : isCooldown ? (
            <>
              <Timer className="mr-2 h-6 w-6" />
              Aguarde {cooldownTime}s
            </>
          ) : signal || (error && selectedAsset) ? 'Gerar Novo Sinal' : 'Gerar Sinal'}
        </Button>
      </div>
    </div>
  );
}

type SignalInfoProps = {
    label: string;
    value: string;
    isTime?: boolean;
    isAnalysis?: boolean;
    analysisType?: 'Compra' | 'Venda';
}

const SignalInfo = ({ label, value, isTime = false, isAnalysis = false, analysisType }: SignalInfoProps) => {
    
    const valueClass = isAnalysis 
        ? analysisType === 'Compra' ? 'text-green-500' : 'text-red-500'
        : 'text-white';
    
    return (
        <div className="flex justify-between border-b border-gray-700/50 pb-2">
            <span className="font-medium text-gray-400">{label}</span>
            <span className={`font-bold ${valueClass}`}>
                {value}
            </span>
        </div>
    )
}

const CountdownTimer = ({ entryTimestamp, endTime }: { entryTimestamp: number, endTime: number }) => {
    const [now, setNow] = useState(Date.now());
    const intervalRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const update = () => setNow(Date.now());

        // Sincroniza com o próximo segundo
        const firstTimeout = setTimeout(() => {
            update();
            intervalRef.current = setInterval(update, 1000);
        }, 1000 - (new Date().getMilliseconds()));

        return () => {
            clearTimeout(firstTimeout);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const hasStarted = now >= entryTimestamp;
    const hasFinished = now >= endTime;
    const timeLeft = endTime - now;

    const formatTimeLeft = (ms: number) => {
        if (ms <= 0) return "00:00";
        const minutes = String(Math.floor((ms / 1000) / 60)).padStart(2, '0');
        const seconds = String(Math.floor((ms / 1000) % 60)).padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    if (hasFinished) {
        return (
            <div className="mt-4 flex flex-col items-center justify-center rounded-lg bg-gray-800 p-3">
                <span className="text-sm font-medium text-gray-400">Sinal Finalizado</span>
                <div className="flex items-center text-2xl font-bold text-red-500">
                    <CheckCircle className="mr-2 h-6 w-6" />
                    <span>00:00</span>
                </div>
            </div>
        );
    }
    
    if (hasStarted) {
        return (
            <div className="mt-4 flex flex-col items-center justify-center rounded-lg bg-gray-800 p-3">
                <span className="text-sm font-medium text-gray-400">Tempo Restante</span>
                <div className="flex items-center text-2xl font-bold text-primary">
                    <Clock className="mr-2 h-6 w-6" />
                    <span>{formatTimeLeft(timeLeft)}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4 flex flex-col items-center justify-center rounded-lg bg-gray-800 p-3">
            <span className="text-sm font-medium text-gray-400">Aguardando horário de entrada...</span>
             <div className="flex items-center text-2xl font-bold text-gray-500">
                <Timer className="mr-2 h-6 w-6" />
                <span>--:--</span>
            </div>
        </div>
    );
};
