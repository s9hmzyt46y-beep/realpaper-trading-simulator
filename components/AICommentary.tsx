"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";

interface AICommentaryProps {
  symbol: string;
  priceData?: Array<{ datetime: string; close: number }>;
  currentPrice?: number;
}

export default function AICommentary({ symbol, priceData, currentPrice }: AICommentaryProps) {
  const [commentary, setCommentary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommentary = async () => {
    if (!symbol) return;

    setLoading(true);
    setError(null);

    try {
      // Calculate price change if we have historical data
      let priceChange = 0;
      let priceChangePercent = 0;

      if (priceData && priceData.length >= 2) {
        const latestPrice = priceData[0].close;
        const previousPrice = priceData[1].close;
        priceChange = latestPrice - previousPrice;
        priceChangePercent = (priceChange / previousPrice) * 100;
      } else if (currentPrice) {
        // Use a mock comparison if no historical data
        priceChange = 0;
        priceChangePercent = 0;
      }

      const response = await fetch("/api/ai/commentary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          priceData: priceData?.slice(0, 10),
          priceChange,
          priceChangePercent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch commentary");
      }

      const data = await response.json();
      setCommentary(data.commentary);
    } catch (err) {
      console.error("AI Commentary error:", err);
      setError("Unable to generate commentary at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (symbol && priceData) {
      fetchCommentary();
    }
  }, [symbol]); // Only fetch on symbol change, not on every priceData update

  if (!symbol) return null;

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">AI Market Commentary</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCommentary}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !commentary && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analyzing {symbol}...</span>
          </div>
        )}
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}
        {commentary && !loading && (
          <div className="text-sm leading-relaxed">
            {commentary}
          </div>
        )}
        {!commentary && !loading && !error && (
          <div className="text-sm text-muted-foreground">
            Click refresh to generate AI analysis for {symbol}.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

