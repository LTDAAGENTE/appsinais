'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Loader } from 'lucide-react';

interface Signal {
  asset: string;
  entryTime: string;
  expiration: string;
  analysis: 'Compra' | 'Venda';
  protection1: string;
  protection2: string;
}

const ASSETS = ['EUR/USD', 'GBP/JPY', 'AUD/CAD', 'USD/JPY', 'EUR/GBP OTC', 'AUD/USD OTC'];
const EXPIRATIONS = ['1 minuto', '5 minutos'];

// Função para formatar a hora com dois dígitos
const formatTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function Home() {
  const [signal, setSignal] = useState<Signal | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSignal = () => {
    setIsLoading(true);
    setSignal(null); 

    // Simula um tempo de espera para a geração do sinal
    setTimeout(() => {
      // Gera dados aleatórios
      const randomAsset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
      const randomExpiration = EXPIRATIONS[Math.floor(Math.random() * EXPIRATIONS.length)];
      const randomAnalysis = Math.random() > 0.5 ? 'Compra' : 'Venda';

      // Gera horários
      const now = new Date();
      const entryTime = new Date(now.getTime() + 1 * 60 * 1000); // 1 minuto a partir de agora
      const protection1 = new Date(entryTime.getTime() + 1 * 60 * 1000); // 1 minuto após a entrada
      const protection2 = new Date(protection1.getTime() + 1 * 60 * 1000); // 1 minuto após a proteção 1


      setSignal({
        asset: randomAsset,
        entryTime: formatTime(entryTime),
        expiration: randomExpiration,
        analysis: randomAnalysis,
        protection1: formatTime(protection1),
        protection2: formatTime(protection2),
      });
      setIsLoading(false);
    }, 2000); // 2 segundos de simulação
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-900 p-4 text-white">
      <div className="w-full max-w-sm">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <Loader size={64} className="mb-4 text-primary animate-spin" />
              <h1 className="text-2xl font-bold mb-2">Gerando Sinal...</h1>
              <p className="text-gray-400">Aguarde um momento.</p>
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
              <SignalInfo label="Entrada às:" value={signal.entryTime} isTime={true} />
              <SignalInfo label="Expiração:" value={signal.expiration} />
              <SignalInfo label="Análise:" value={signal.analysis} isAnalysis={true} analysisType={signal.analysis} />
              <SignalInfo label="Proteção 1:" value={signal.protection1} isTime={true}/>
              <SignalInfo label="Proteção 2:" value={signal.protection2} isTime={true}/>
            </CardContent>
          </Card>
        ) : (
           <div className="flex flex-col items-center justify-center text-center">
              <Flame size={64} className="mb-4 text-primary" />
              <h1 className="text-3xl font-bold mb-2">Gerador de Sinais</h1>
              <p className="text-gray-400">Clique no botão abaixo para gerar um novo sinal de opções binárias.</p>
            </div>
        )}

        <Button
          onClick={handleGenerateSignal}
          disabled={isLoading}
          size="lg"
          className="mt-8 w-full rounded-full bg-primary py-8 text-xl font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/50 transition-transform duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
           {isLoading ? (
            <>
              <Loader className="mr-2 h-6 w-6 animate-spin" />
              Gerando...
            </>
          ) : signal ? 'Gerar Novo Sinal' : 'Gerar Sinal'}
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
        ? analysisType === 'Compra' ? 'text-green-400' : 'text-red-400'
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
