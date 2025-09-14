'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { CommuteLog, CommuteType } from '@/lib/types';
import { useMemo } from 'react';
import { TrendingUp, Tag } from 'lucide-react';
import { subDays, isAfter } from 'date-fns';

export function CommuteSummary({ logs, commuteTypes }: { logs: CommuteLog[]; commuteTypes: CommuteType[] }) {
  const summaryData = useMemo(() => {
    const last30DaysLogs = logs.filter((log) => isAfter(new Date(log.date), subDays(new Date(), 30)));

    const totalTime = last30DaysLogs.reduce((acc, log) => acc + log.goingDuration + log.returnDuration, 0);
    const avgTime = last30DaysLogs.length > 0 ? totalTime / (last30DaysLogs.length * 2) : 0;

    const typeCounts = last30DaysLogs.reduce((acc, log) => {
      acc[log.goingCommuteTypeId] = (acc[log.goingCommuteTypeId] || 0) + 1;
      acc[log.returnCommuteTypeId] = (acc[log.returnCommuteTypeId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentTypeId = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])[0];
    const mostFrequentType = commuteTypes.find((t) => t.id === mostFrequentTypeId);

    const chartData = commuteTypes
      .map((type) => {
        const count = last30DaysLogs.reduce((sum, log) => {
          let typeCount = 0;
          if (log.goingCommuteTypeId === type.id) typeCount++;
          if (log.returnCommuteTypeId === type.id) typeCount++;
          return sum + typeCount;
        }, 0);
        return {
          name: type.name,
          count: count,
        };
      })
      .filter((d) => d.count > 0);

    return { totalTime, avgTime, mostFrequentType, chartData };
  }, [logs, commuteTypes]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Commute Summary
        </CardTitle>
        <CardDescription>Your commute stats for the last 30 days.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-2">
            <p className="text-2xl font-bold">{(summaryData.totalTime / 60).toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Hours</p>
          </div>
          <div className="p-2">
            <p className="text-2xl font-bold">{summaryData.avgTime.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">Avg. Mins</p>
          </div>
        </div>

        {summaryData.mostFrequentType && (
          <div className="flex items-center justify-center text-sm text-muted-foreground gap-2">
            <Tag className="h-4 w-4" />
            <span>
              Most frequent: <strong>{summaryData.mostFrequentType.name}</strong>
            </span>
          </div>
        )}

        {summaryData.chartData.length > 0 ? (
          <div className="h-[150px] w-full">
            <ChartContainer
              config={{
                count: {
                  label: 'Count',
                },
              }}
              className="h-full w-full"
            >
              <BarChart
                data={summaryData.chartData}
                accessibilityLayer
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--foreground))"
                  opacity={0.6}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--foreground))"
                  opacity={0.6}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Count" />
              </BarChart>
            </ChartContainer>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground pt-4">Not enough data to display chart.</p>
        )}
      </CardContent>
    </Card>
  );
}
