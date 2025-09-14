'use server';
/**
 * @fileOverview Predicts future commute times based on past commute logs and current conditions.
 *
 * - predictFutureCommuteTimes - A function that predicts future commute times.
 * - PredictFutureCommuteTimesInput - The input type for the predictFutureCommuteTimes function.
 * - PredictFutureCommuteTimesOutput - The return type for the predictFutureCommuteTimes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictFutureCommuteTimesInputSchema = z.object({
  timeOfDay: z.string().describe('The time of day for the commute (e.g., 8:00 AM).'),
  commuteType: z.string().describe('The type of commute (e.g., car, bus, train).'),
  pastCommuteLogs: z.string().describe('A JSON string containing an array of past commute logs, where each log includes the date, commute type, and duration in minutes.'),
});
export type PredictFutureCommuteTimesInput = z.infer<typeof PredictFutureCommuteTimesInputSchema>;

const PredictFutureCommuteTimesOutputSchema = z.object({
  predictedDuration: z.number().describe('The predicted commute duration in minutes.'),
  confidence: z.string().describe('A description of the confidence level of the prediction (e.g., high, medium, low).'),
});
export type PredictFutureCommuteTimesOutput = z.infer<typeof PredictFutureCommuteTimesOutputSchema>;

export async function predictFutureCommuteTimes(input: PredictFutureCommuteTimesInput): Promise<PredictFutureCommuteTimesOutput> {
  return predictFutureCommuteTimesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictFutureCommuteTimesPrompt',
  input: {schema: PredictFutureCommuteTimesInputSchema},
  output: {schema: PredictFutureCommuteTimesOutputSchema},
  prompt: `You are a commute time prediction expert.  Given the time of day, commute type, and past commute logs, predict the commute duration in minutes.

Time of Day: {{{timeOfDay}}}
Commute Type: {{{commuteType}}}
Past Commute Logs: {{{pastCommuteLogs}}}

Consider the following when making your prediction:

*   Typical commute times for the given time of day and commute type.
*   Trends in the past commute logs (e.g., increasing or decreasing commute times over time).
*   Any outliers in the past commute logs (e.g., unusually long or short commutes).

Output the predicted commute duration in minutes, and also a description of your confidence in the prediction.`,
});

const predictFutureCommuteTimesFlow = ai.defineFlow(
  {
    name: 'predictFutureCommuteTimesFlow',
    inputSchema: PredictFutureCommuteTimesInputSchema,
    outputSchema: PredictFutureCommuteTimesOutputSchema,
  },
  async input => {
    try {
      // Attempt to parse the pastCommuteLogs string as JSON
      JSON.parse(input.pastCommuteLogs);
    } catch (e) {
      throw new Error('Invalid JSON format for pastCommuteLogs: ' + e);
    }
    const {output} = await prompt(input);
    return output!;
  }
);
