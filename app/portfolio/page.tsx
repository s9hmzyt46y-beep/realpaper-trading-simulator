"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { db } from "@/lib/instantdb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { useAutoRefresh } from "@/store/autoRefresh";
import { useSimulationDate } from "@/store/simulationDate";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import PortfolioChart from "@/components/charts/PortfolioChart";
import PLChart from "@/components/charts/PLChart";
import { toast } from "sonner";

interface Position {
  id: string;
  symbol: string;
  quantity: number;
  avgCostPerShare: number;
  totalCost: number;
  currentPrice?: number;
  currentValue?: number;
  profitLoss?: number;
  profitLossPercent?: number;
}

export default function PortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const { isEnabled, setEnabled, lastUpdated, updateLastRefresh, interval } = useAutoRefresh();
  const { simulationDate, isSimulationMode } = useSimulationDate();

  const [positions, setPositions] = useState<Position[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [portfolioSnapshots, setPortfolioSnapshots] = useState<any[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const lastPositionsCount = useRef(0);

  // Initialize user and fetch data - useQuery must be at top level
  const { isLoading, error, data } = db.useQuery(
    session?.user?.id
      ? {
          users: {
            $: {
              where: {
                id: session.user.id,
              },
            },
          },
          positions: {
            $: {
              where: {
                userId: session.user.id,
              },
            },
          },
          portfolioSnapshots: {
            $: {
              where: {
                userId: session.user.id,
              },
            },
          },
        }
      : { users: {}, positions: {}, portfolioSnapshots: {} }
  );

  // Create a mock user if not found in DB (for simplicity during development)
  const dbUser = data?.users?.[0];
  const user = dbUser || {
    id: session?.user?.id || "",
    email: session?.user?.email || "",
    username: session?.user?.name || session?.user?.email?.split("@")[0] || "User",
    initialBalance: 10000,
    currentCash: 10000,
    createdAt: Date.now(),
  };

  // Update positions and snapshots from data
  useEffect(() => {
    if (data?.positions && Array.isArray(data.positions)) {
      setPositions(data.positions as Position[]);
      
      // IMMEDIATELY initialize prices with avgCostPerShare
      const initialPrices: Record<string, number> = {};
      data.positions.forEach((p: any) => {
        initialPrices[p.symbol] = p.avgCostPerShare || 0;
      });
      setPrices(initialPrices);
    }
    if (data?.portfolioSnapshots) {
      setPortfolioSnapshots(data.portfolioSnapshots);
    }
  }, [data]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Fetch current prices for all positions
  const fetchPrices = async () => {
    if (positions.length === 0) {
      return;
    }

    setRefreshing(true);
    
    try {
      const newPrices: Record<string, number> = { ...prices }; // Start with existing prices
      
      const pricePromises = positions.map(async (position) => {
        try {
          const simDate = isSimulationMode && simulationDate
            ? (simulationDate instanceof Date ? simulationDate : new Date(simulationDate))
            : null;
          const dateParam = simDate
            ? `&date=${simDate.toISOString().split('T')[0]}`
            : '';
          
          const response = await fetch(`/api/stocks/quote?symbol=${position.symbol}${dateParam}`);
          const data = await response.json();
          
          // Update with real price if available
          if (data.price) {
            newPrices[position.symbol] = data.price;
          }
        } catch (error) {
          // Keep existing price (avgCostPerShare) on error
        }
      });

      await Promise.all(pricePromises);
      setPrices(newPrices);
      updateLastRefresh();
      
      toast.success("Prices refreshed");
    } catch (error) {
      toast.error("Failed to fetch prices");
    } finally {
      setRefreshing(false);
    }
  };

  // Initial fetch - run when positions are loaded from DB
  useEffect(() => {
    const dbPositionsCount = data?.positions?.length || 0;
    
    if (!isLoading && dbPositionsCount > 0 && dbPositionsCount !== lastPositionsCount.current) {
      lastPositionsCount.current = dbPositionsCount;
      // Fetch prices after positions are loaded from DB
      setTimeout(() => {
        if (positions.length > 0) {
          fetchPrices();
        }
      }, 500); // Increased timeout to ensure positions state is fully updated
    }
  }, [isLoading, data?.positions?.length, positions.length]);

  // Auto-refresh
  useEffect(() => {
    if (!isEnabled || isLoading) return;

    const intervalId = setInterval(() => {
      fetchPrices();
    }, interval * 1000);

    return () => clearInterval(intervalId);
  }, [isEnabled, interval, isLoading, positions.length]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading portfolio: {error.message}</div>;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Initializing your account...</p>
        </div>
      </div>
    );
  }

  const totalPositionsValue = positions.reduce((sum, p) => {
    const currentPrice = prices[p.symbol] || p.avgCostPerShare;
    return sum + (currentPrice * p.quantity);
  }, 0);
  const totalValue = user.currentCash + totalPositionsValue;
  const totalProfitLoss = totalPositionsValue - positions.reduce((sum, p) => sum + p.totalCost, 0);
  const totalReturn = user.initialBalance > 0
    ? ((totalValue - user.initialBalance) / user.initialBalance) * 100
    : 0;

  const secondsAgo = lastUpdated
    ? Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("portfolio.title")}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={setEnabled}
            />
            <Label>{t("portfolio.autoRefresh")}</Label>
          </div>
          {portfolioSnapshots.length < 2 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                try {
                  const response = await fetch("/api/portfolio/create-snapshots", { method: "POST" });
                  if (response.ok) {
                    toast.success("Historical data generated!");
                    setTimeout(() => window.location.reload(), 1000);
                  }
                } catch (error) {
                  toast.error("Failed to generate data");
                }
              }}
            >
              Generate Historical Data
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPrices}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t("common.refresh")}
          </Button>
        </div>
      </div>

      {secondsAgo !== null && (
        <div className="text-sm text-muted-foreground">
          {t("portfolio.lastUpdated")}: {t("portfolio.secondsAgo", { seconds: secondsAgo })}
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t("portfolio.totalValue")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className={`text-sm ${totalReturn >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatPercent(totalReturn)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              {t("portfolio.cash")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(user.currentCash)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t("portfolio.positions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPositionsValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {totalProfitLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-profit" />
              ) : (
                <TrendingDown className="h-4 w-4 text-loss" />
              )}
              {t("portfolio.profitLoss")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatCurrency(totalProfitLoss)}
            </div>
          </CardContent>
        </Card>
      </div>

      {portfolioSnapshots.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <PortfolioChart data={portfolioSnapshots} />
          <PLChart data={portfolioSnapshots} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("portfolio.positions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No positions yet. Start trading to see your portfolio!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("portfolio.symbol")}</TableHead>
                  <TableHead className="text-right">{t("portfolio.quantity")}</TableHead>
                  <TableHead className="text-right">{t("portfolio.avgCost")}</TableHead>
                  <TableHead className="text-right">{t("portfolio.currentPrice")}</TableHead>
                  <TableHead className="text-right">{t("portfolio.value")}</TableHead>
                  <TableHead className="text-right">{t("portfolio.pl")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => {
                  // ALWAYS show avgCostPerShare (updated with real price if available)
                  const price = prices[position.symbol] || position.avgCostPerShare || 0;
                  const value = price * position.quantity;
                  const pl = value - position.totalCost;
                  const plPercent = position.avgCostPerShare > 0 
                    ? ((price - position.avgCostPerShare) / position.avgCostPerShare) * 100 
                    : 0;
                  
                  return (
                    <TableRow key={position.id}>
                      <TableCell className="font-medium">{position.symbol}</TableCell>
                      <TableCell className="text-right">{position.quantity.toFixed(4)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(position.avgCostPerShare)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(value)}</TableCell>
                      <TableCell className="text-right">
                        <span className={pl >= 0 ? 'text-profit' : 'text-loss'}>
                          {formatCurrency(pl)}
                          <br />
                          <span className="text-xs">({formatPercent(plPercent)})</span>
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
