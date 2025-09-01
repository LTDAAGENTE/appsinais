'use server';

/**
 * @fileOverview Gera sinais de negociação de criptomoedas com par, direção, preço, confiança, TP, SL, duração e timestamp.
 *
 * - generateCryptoSignal - Uma função que gera o sinal de negociação de cripto.
 * - GenerateCryptoSignalInput - O tipo de entrada para a função generateCryptoSignal.
 * - GenerateCryptoSignalOutput - O tipo de retorno para a função generateCryptoSignal.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCryptoSignalInputSchema = z.object({
  pair: z.string().describe('O par de negociação de criptomoedas (ex: BTC/USD).'),
});
export type GenerateCryptoSignalInput = z.infer<typeof GenerateCryptoSignalInputSchema>;

const GenerateCryptoSignalOutputSchema = z.object({
  pair: z.string().describe('O par de negociação de criptomoedas (ex: BTC/USD).'),
  direction: z.enum(['buy', 'sell']).describe('A direção da negociação (compra ou venda).'),
  price: z.number().describe('O preço atual da criptomoeda.'),
  confidence: z.number().min(0).max(1).describe('O nível de confiança do sinal (0 a 1).'),
  takeProfit: z.number().describe('O preço sugerido para Take Profit.'),
  stopLoss: z.number().describe('O preço sugerido para Stop Loss.'),
  durationMinutes: z.number().int().min(1).describe('A duração recomendada da operação em minutos (ex: 5, 15).'),
  timestamp: z.string().describe('O timestamp de quando o sinal foi gerado (formato ISO).'),
});
export type GenerateCryptoSignalOutput = z.infer<typeof GenerateCryptoSignalOutputSchema>;

export async function generateCryptoSignal(input: GenerateCryptoSignalInput): Promise<GenerateCryptoSignalOutput> {
  return generateCryptoSignalFlow(input);
}

const calculateTakeProfitAndStopLoss = ai.defineTool({
  name: 'calculateTakeProfitAndStopLoss',
  description: 'Calcula valores razoáveis de take profit e stop loss com base no preço atual e no par de negociação.',
  inputSchema: z.object({
    pair: z.string().describe('O par de negociação de criptomoedas (ex: BTC/USD).'),
    price: z.number().describe('O preço atual da criptomoeda.'),
    direction: z.enum(['buy', 'sell']).describe('A direção da negociação (compra ou venda).'),
  }),
  outputSchema: z.object({
    takeProfit: z.number().describe('O preço calculado para Take Profit.'),
    stopLoss: z.number().describe('O preço calculado para Stop Loss.'),
  }),
}, async (input) => {
  // Implementação de exemplo: Uma implementação real calcularia TP e SL com base na volatilidade, níveis de suporte, etc.
  const {price, direction} = input;
  const takeProfit = direction === 'buy' ? price * 1.02 : price * 0.98; // 2% de lucro
  const stopLoss = direction === 'buy' ? price * 0.98 : price * 1.02; // 2% de perda
  return {takeProfit, stopLoss};
});


const generateCryptoSignalPrompt = ai.definePrompt({
  name: 'generateCryptoSignalPrompt',
  input: {schema: GenerateCryptoSignalInputSchema},
  output: {schema: GenerateCryptoSignalOutputSchema},
  tools: [calculateTakeProfitAndStopLoss],
  prompt: `Você é um gerador especialista em sinais de negociação de criptomoedas.

  Com base nas condições atuais do mercado, gere um sinal de negociação para o seguinte par de criptomoedas: {{{pair}}}.

  Inclua o par de negociação, direção (compra ou venda), preço atual, nível de confiança (0 a 1), preço de take profit, preço de stop loss, a duração da operação em minutos (por exemplo: 5, 10, 15) e o timestamp atual.

  Use a ferramenta calculateTakeProfitAndStopLoss para determinar valores razoáveis de take profit e stop loss.
  
  A duração da operação deve ser um valor inteiro que represente minutos.

  Certifique-se de que o timestamp esteja no formato ISO.

  A saída deve ser em formato JSON.
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
