'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { predictFutureCommuteTimes, PredictFutureCommuteTimesOutput } from '@/ai/flows/predict-future-commute-times';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Bot, Loader2 } from 'lucide-react';
import type { CommuteLog, CommuteType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  timeOfDay: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please enter time in HH:MM format.'),
  commuteType: z.string().min(1, 'Please select a commute type.'),
});

type PredictionResult = PredictFutureCommuteTimesOutput | null;

export function CommutePredictor({ logs, commuteTypes }: { logs: CommuteLog[]; commuteTypes: CommuteType[] }) {
  const [prediction, setPrediction] = useState<PredictionResult>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timeOfDay: '08:00',
      commuteType: commuteTypes.length > 0 ? commuteTypes[0].id : '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setPrediction(null);
    try {
      const selectedType = commuteTypes.find((t) => t.id === values.commuteType);
      if (!selectedType) throw new Error('Selected commute type not found.');

      const pastCommuteLogsForType = logs.flatMap((log) => {
        const entries = [];
        if (log.goingCommuteTypeId === values.commuteType) {
          entries.push({
            date: new Date(log.date).toISOString().split('T')[0],
            commuteType: selectedType.name,
            duration: log.goingDuration,
          });
        }
        if (log.returnCommuteTypeId === values.commuteType) {
          entries.push({
            date: new Date(log.date).toISOString().split('T')[0],
            commuteType: selectedType.name,
            duration: log.returnDuration,
          });
        }
        return entries;
      });

      if (pastCommuteLogsForType.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Not enough data',
          description: `No past logs found for "${selectedType.name}" to make a prediction.`,
        });
        setIsLoading(false);
        return;
      }

      const result = await predictFutureCommuteTimes({
        timeOfDay: values.timeOfDay,
        commuteType: selectedType.name,
        pastCommuteLogs: JSON.stringify(pastCommuteLogsForType),
      });

      setPrediction(result);
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Prediction Error',
        description: e.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Commute Predictor
        </CardTitle>
        <CardDescription>Let AI predict your next commute time based on your logs.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="timeOfDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time of Day</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="commuteType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commute Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a commute type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {commuteTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4">
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Predicting...
                </>
              ) : (
                'Predict Commute'
              )}
            </Button>
            {prediction && (
              <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle>Prediction Result</AlertTitle>
                <AlertDescription>
                  Estimated duration is <strong>{prediction.predictedDuration} minutes</strong>. (Confidence:{' '}
                  {prediction.confidence})
                </AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
