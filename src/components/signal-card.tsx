import type { GenerateCryptoSignalOutput as Signal } from '@/ai/flows/generate-crypto-signal';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDownCircle, ArrowUpCircle, Target, ShieldX } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type SignalCardProps = {
  signal: Signal;
};

export function SignalCard({ signal }: SignalCardProps) {
  const isBuy = signal.direction === 'buy';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(price);
  };

  return (
    <Card className="w-full animate-fade-in-down overflow-hidden border-l-4" style={{ borderLeftColor: isBuy ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">{signal.pair}</CardTitle>
        <Badge variant={isBuy ? 'default' : 'destructive'} className="text-sm">
          {isBuy ? (
            <ArrowUpCircle className="mr-2 h-4 w-4" />
          ) : (
            <ArrowDownCircle className="mr-2 h-4 w-4" />
          )}
          {signal.direction.toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Preço de Entrada</p>
          <p className="text-4xl font-bold tracking-tighter text-accent">
            {formatPrice(signal.price)}
          </p>
        </div>

        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Confiança</span>
                <span className="font-medium">{ (signal.confidence * 100).toFixed(0) }%</span>
            </div>
            <Progress value={signal.confidence * 100} className={cn('h-2', !isBuy && '[&>div]:bg-destructive')} />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="rounded-md border p-4">
            <div className="flex items-center justify-center gap-2 text-primary">
                <Target className="h-5 w-5"/>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Take Profit</h3>
            </div>
            <p className="mt-2 text-lg font-semibold">{formatPrice(signal.takeProfit)}</p>
          </div>
          <div className="rounded-md border p-4">
            <div className="flex items-center justify-center gap-2 text-destructive">
                <ShieldX className="h-5 w-5"/>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Stop Loss</h3>
            </div>
            <p className="mt-2 text-lg font-semibold">{formatPrice(signal.stopLoss)}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="py-2 px-6">
        <CardDescription className="w-full text-right text-xs">
          {format(new Date(signal.timestamp), "d 'de' MMMM 'de' yyyy 'às' HH:mm:ss", { locale: ptBR })}
        </CardDescription>
      </CardFooter>
    </Card>
  );
}
