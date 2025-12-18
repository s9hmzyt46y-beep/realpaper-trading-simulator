"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface PriceChartProps {
  data: Array<{
    datetime: string;
    close: number;
  }>;
  symbol: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium">{payload[0].payload.date}</p>
        <p className="text-lg font-bold text-primary">
          {payload[0].value.toFixed(2)} €
        </p>
      </div>
    );
  }
  return null;
};

export default function PriceChart({ data, symbol }: PriceChartProps) {
  const formattedData = data.map((item) => ({
    date: new Date(item.datetime).toLocaleDateString(),
    price: item.close,
  })).reverse();

  // Calculate if price is trending up or down
  const firstPrice = formattedData[0]?.price || 0;
  const lastPrice = formattedData[formattedData.length - 1]?.price || 0;
  const isPositiveTrend = lastPrice >= firstPrice;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? ((priceChange / firstPrice) * 100).toFixed(2) : '0';

  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {symbol} Price Chart
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <span className={isPositiveTrend ? 'text-green-500' : 'text-red-500'}>
              {isPositiveTrend ? '↑' : '↓'} {priceChangePercent}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart 
            data={formattedData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="0%" 
                  stopColor={isPositiveTrend ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 51%)"} 
                  stopOpacity={0.8} 
                />
                <stop 
                  offset="50%" 
                  stopColor={isPositiveTrend ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 51%)"} 
                  stopOpacity={0.3} 
                />
                <stop 
                  offset="100%" 
                  stopColor={isPositiveTrend ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 51%)"} 
                  stopOpacity={0.05} 
                />
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
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toFixed(0)}€`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={isPositiveTrend ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 51%)"} 
              strokeWidth={3}
              fill="url(#priceGradient)"
              dot={false}
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

