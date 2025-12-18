"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface PLChartProps {
  data: Array<{
    snapshotDate: number;
    profitLoss: number;
  }>;
}

export default function PLChart({ data }: PLChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profit/Loss Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No historical data available. Make some trades to see your P/L history.
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map((item) => ({
    date: new Date(item.snapshotDate).toLocaleDateString(),
    timestamp: item.snapshotDate,
    pl: item.profitLoss,
  })).sort((a, b) => a.timestamp - b.timestamp);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit/Loss Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="pl">
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.pl >= 0 ? "#22c55e" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

