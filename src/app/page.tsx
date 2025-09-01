'use client';

import { useState, useMemo } from 'react';
import { generateCryptoSignal, type GenerateCryptoSignalOutput } from '@/ai/flows/generate-crypto-signal';
import { AppHeader } from '@/components/app-header';
import { SignalCard } from '@/components/signal-card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const TRADING_PAIRS = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'DOGE/USD', 'XRP/USD'];
const MAX_SIGNALS = 50;

export default function Home() {
  const [signals, setSignals] = useState<GenerateCryptoSignalOutput[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateSignal = async () => {
    setIsGenerating(true);
    try {
      const pair = selectedPair === 'All'
        ? TRADING_PAIRS[Math.floor(Math.random() * TRADING_PAIRS.length)]
        : selectedPair;
        
      const newSignal = await generateCryptoSignal({ pair });
      setSignals((prev) => [newSignal, ...prev].slice(0, MAX_SIGNALS));
    } catch (error) {
      console.error('Falha ao gerar novo sinal:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível gerar um sinal de negociação. Por favor, tente novamente.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredSignals = useMemo(() => {
    if (selectedPair === 'All') {
      return signals;
    }
    return signals.filter((signal) => signal.pair === selectedPair);
  }, [signals, selectedPair]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader
        pairs={TRADING_PAIRS}
        selectedPair={selectedPair}
        onPairChange={setSelectedPair}
      />
      <main className="flex flex-1 flex-col items-center gap-8 p-4 md:p-8">
        <div className="w-full max-w-2xl space-y-4">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-2xl font-bold tracking-tight">Gere seu Sinal para IQ Option</h2>
              <p className="max-w-md text-muted-foreground">
                Selecione um par de moedas e clique no botão para receber um sinal de day trade gerado por nossa IA para a plataforma IQ Option.
              </p>
              <Button onClick={handleGenerateSignal} disabled={isGenerating} size="lg">
                <Sparkles className="mr-2 h-5 w-5" />
                {isGenerating ? 'Gerando Sinal...' : `Gerar Sinal para ${selectedPair === 'All' ? 'Par Aleatório' : selectedPair}`}
              </Button>
            </div>
          </div>
          
          {isGenerating && signals.length === 0 && <SignalCardSkeleton />}

          {!isGenerating && signals.length === 0 && (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-card p-12 text-center">
                <p className="text-lg font-medium text-muted-foreground">Nenhum sinal gerado ainda.</p>
                <p className="text-sm text-muted-foreground/80">Clique no botão acima para começar.</p>
            </div>
          )}

          {filteredSignals.map((signal) => (
            <SignalCard key={signal.timestamp + signal.pair} signal={signal} />
          ))}
        </div>
      </main>
    </div>
  );
}

const SignalCardSkeleton = () => (
  <div className="w-full space-y-4 rounded-lg border bg-card p-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-8 w-1/4" />
    </div>
    <div className="flex flex-col items-center space-y-2 pt-4">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-10 w-1/2" />
    </div>
    <div className="space-y-2 pt-4">
      <div className="flex justify-between">
         <Skeleton className="h-4 w-1/4" />
         <Skeleton className="h-4 w-1/5" />
      </div>
      <Skeleton className="h-2 w-full" />
    </div>
    <div className="grid grid-cols-2 gap-4 pt-4">
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
    </div>
  </div>
);
