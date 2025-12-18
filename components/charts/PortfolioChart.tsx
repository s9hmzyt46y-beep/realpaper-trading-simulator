"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface PortfolioChartProps {
  data: Array<{
    snapshotDate: number;
    totalValue: number;
  }>;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium">{payload[0].payload.date}</p>
        <p className="text-lg font-bold text-primary">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function PortfolioChart({ data }: PortfolioChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Portfolio Value Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No historical data available. Make some trades to see your portfolio history.
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map((item) => ({
    date: new Date(item.snapshotDate).toLocaleDateString(),
    timestamp: item.snapshotDate,
    value: item.totalValue,
  })).sort((a, b) => a.timestamp - b.timestamp);

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Portfolio Value Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart 
            data={formattedData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8} />
                <stop offset="50%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.05} />
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
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(142, 76%, 36%)" 
              strokeWidth={3}
              fill="url(#portfolioGradient)"
              dot={formattedData.length < 5 ? { fill: "hsl(142, 76%, 36%)", r: 5, strokeWidth: 2, stroke: "#fff" } : false}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

