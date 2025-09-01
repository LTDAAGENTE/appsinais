'use server';

/**
 * @fileOverview Generates cryptocurrency trading signals with pair, direction, price, confidence, TP, SL, and timestamp.
 *
 * - generateCryptoSignal - A function that generates the crypto trading signal.
 * - GenerateCryptoSignalInput - The input type for the generateCryptoSignal function.
 * - GenerateCryptoSignalOutput - The return type for the generateCryptoSignal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCryptoSignalInputSchema = z.object({
  pair: z.string().describe('The cryptocurrency trading pair (e.g., BTC/USD).'),
});
export type GenerateCryptoSignalInput = z.infer<typeof GenerateCryptoSignalInputSchema>;

const GenerateCryptoSignalOutputSchema = z.object({
  pair: z.string().describe('The cryptocurrency trading pair (e.g., BTC/USD).'),
  direction: z.enum(['buy', 'sell']).describe('The trading direction (buy or sell).'),
  price: z.number().describe('The current price of the cryptocurrency.'),
  confidence: z.number().min(0).max(1).describe('The confidence level of the signal (0 to 1).'),
  takeProfit: z.number().describe('The suggested take profit price.'),
  stopLoss: z.number().describe('The suggested stop loss price.'),
  timestamp: z.string().describe('The timestamp of when the signal was generated (ISO format).'),
});
export type GenerateCryptoSignalOutput = z.infer<typeof GenerateCryptoSignalOutputSchema>;

export async function generateCryptoSignal(input: GenerateCryptoSignalInput): Promise<GenerateCryptoSignalOutput> {
  return generateCryptoSignalFlow(input);
}

const calculateTakeProfitAndStopLoss = ai.defineTool({
  name: 'calculateTakeProfitAndStopLoss',
  description: 'Calculates reasonable take profit and stop loss values based on the current price and trading pair.',
  inputSchema: z.object({
    pair: z.string().describe('The cryptocurrency trading pair (e.g., BTC/USD).'),
    price: z.number().describe('The current price of the cryptocurrency.'),
    direction: z.enum(['buy', 'sell']).describe('The trading direction (buy or sell).'),
  }),
  outputSchema: z.object({
    takeProfit: z.number().describe('The calculated take profit price.'),
    stopLoss: z.number().describe('The calculated stop loss price.'),
  }),
}, async (input) => {
  // Placeholder implementation:  A real implementation would calculate TP and SL based on volatility, support levels, etc.
  const {price, direction} = input;
  const takeProfit = direction === 'buy' ? price * 1.02 : price * 0.98; // 2% profit
  const stopLoss = direction === 'buy' ? price * 0.98 : price * 1.02; // 2% loss
  return {takeProfit, stopLoss};
});


const generateCryptoSignalPrompt = ai.definePrompt({
  name: 'generateCryptoSignalPrompt',
  input: {schema: GenerateCryptoSignalInputSchema},
  output: {schema: GenerateCryptoSignalOutputSchema},
  tools: [calculateTakeProfitAndStopLoss],
  prompt: `You are an expert cryptocurrency trading signal generator.

  Based on the current market conditions, generate a trading signal for the following cryptocurrency pair: {{{pair}}}.

  Include the trading pair, direction (buy or sell), current price, confidence level (0 to 1), take profit price, stop loss price, and the current timestamp.

  Use the calculateTakeProfitAndStopLoss tool to determine reasonable take profit and stop loss values.

  Make sure the timestamp is in ISO format.

  Output should be in JSON format.
  `,
});

const generateCryptoSignalFlow = ai.defineFlow(
  {
    name: 'generateCryptoSignalFlow',
    inputSchema: GenerateCryptoSignalInputSchema,
    outputSchema: GenerateCryptoSignalOutputSchema,
  },
  async input => {
    const {output} = await generateCryptoSignalPrompt(input);
    return output!;
  }
);
