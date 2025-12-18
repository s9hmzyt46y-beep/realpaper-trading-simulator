"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface PLChartProps {
  data: Array<{
    snapshotDate: number;
    profitLoss: number;
  }>;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const isPositive = value >= 0;
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium">{payload[0].payload.date}</p>
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <p className={`text-lg font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(value)}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function PLChart({ data }: PLChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Profit/Loss Over Time
          </CardTitle>
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

  const totalPL = formattedData.reduce((sum, item) => sum + item.pl, 0);
  const isPositive = totalPL >= 0;

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="w-5 h-5 text-green-500" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-500" />
          )}
          Profit/Loss Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={formattedData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#dc2626" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.3}
              vertical={false}
            />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value >= 0 ? '+' : ''}${(value / 1000).toFixed(1)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="pl"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {formattedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.pl >= 0 ? "url(#positiveGradient)" : "url(#negativeGradient)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

