'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bitcoin } from 'lucide-react';

type AppHeaderProps = {
  pairs: string[];
  selectedPair: string;
  onPairChange: (pair: string) => void;
};

export function AppHeader({ pairs, selectedPair, onPairChange }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Bitcoin className="mr-2 h-6 w-6 text-accent" />
          <h1 className="text-xl font-bold tracking-tight">Crypto Signal Stream</h1>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Select value={selectedPair} onValueChange={onPairChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by pair" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Pairs</SelectItem>
              {pairs.map((pair) => (
                <SelectItem key={pair} value={pair}>
                  {pair}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
