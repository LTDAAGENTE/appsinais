'use client';

import { useState, useEffect, useMemo } from 'react';
import { generateCryptoSignal, type GenerateCryptoSignalOutput } from '@/ai/flows/generate-crypto-signal';
import { AppHeader } from '@/components/app-header';
import { SignalCard } from '@/components/signal-card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const TRADING_PAIRS = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'DOGE/USD', 'XRP/USD'];
const SIGNAL_GENERATION_INTERVAL = 5000; // 5 seconds
const MAX_SIGNALS = 50;

export default function Home() {
  const [signals, setSignals] = useState<GenerateCryptoSignalOutput[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Generate initial signals
    const generateInitialSignals = async () => {
      setIsLoading(true);
      const initialSignals: GenerateCryptoSignalOutput[] = [];
      try {
        // Generate fewer initial signals for faster load
        for (let i = 0; i < 3; i++) {
          const pair = TRADING_PAIRS[i % TRADING_PAIRS.length];
          const signal = await generateCryptoSignal({ pair });
          initialSignals.push(signal);
        }
        setSignals(initialSignals.reverse()); 
      } catch (error) {
        console.error('Falha ao gerar sinais iniciais:', error);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível buscar os sinais de negociação iniciais. Por favor, tente novamente mais tarde.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateInitialSignals();

    // Set up interval for new signals
    const intervalId = setInterval(async () => {
      try {
        const pair = TRADING_PAIRS[Math.floor(Math.random() * TRADING_PAIRS.length)];
        const newSignal = await generateCryptoSignal({ pair });
        setSignals((prev) => [newSignal, ...prev].slice(0, MAX_SIGNALS));
      } catch (error) {
        console.error('Falha ao gerar novo sinal:', error);
        // Silently fail on interval errors to avoid spamming user with toasts
      }
    }, SIGNAL_GENERATION_INTERVAL);

    return () => clearInterval(intervalId);
  }, [toast]);

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
          {isLoading && (
            <>
              <SignalCardSkeleton />
              <SignalCardSkeleton />
              <SignalCardSkeleton />
            </>
          )}
          {!isLoading && filteredSignals.length === 0 && (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-card p-12 text-center">
                <p className="text-lg font-medium text-muted-foreground">Nenhum sinal para exibir para {selectedPair}.</p>
                <p className="text-sm text-muted-foreground/80">Novos sinais são gerados a cada 5 segundos.</p>
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
