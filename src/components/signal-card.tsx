import type { GenerateCryptoSignalOutput as Signal } from '@/ai/flows/generate-crypto-signal';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type SignalCardProps = {
  signal: Signal;
};

export function SignalCard({ signal }: SignalCardProps) {
  const isBuy = signal.direction === 'buy';

  return (
    <Card className="w-full animate-fade-in-down overflow-hidden border-l-4" style={{ borderLeftColor: isBuy ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
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
      <CardFooter className="py-3 px-6">
        <CardDescription className="w-full text-right text-sm">
          Entrada: {format(new Date(signal.timestamp), "d 'de' MMMM, HH:mm:ss", { locale: ptBR })}
        </CardDescription>
      </CardFooter>
    </Card>
  );
}
