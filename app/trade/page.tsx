"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { db } from "@/lib/instantdb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { useSimulationDate } from "@/store/simulationDate";
import { toast } from "sonner";
import { Search, TrendingUp, TrendingDown, Loader2, Clock } from "lucide-react";
import AICommentary from "@/components/AICommentary";
import PriceChart from "@/components/charts/PriceChart";
import { format } from "date-fns";

export default function TradePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const { simulationDate, isSimulationMode } = useSimulationDate();

  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [symbol, setSymbol] = useState("");
  const [inputType, setInputType] = useState<"amount" | "shares">("amount");
  const [amount, setAmount] = useState("");
  const [shares, setShares] = useState("");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [position, setPosition] = useState<any>(null);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Trigger to force re-fetch after trade
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  
  // Fetch user AND all positions - useQuery must be at top level
  const { data: userData, isLoading: userDataLoading } = db.useQuery(
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
        }
      : null,
    { deps: [refetchTrigger] } // Re-run query when refetchTrigger changes
  );

  // Initialize user once on first login
  const [initAttempted, setInitAttempted] = useState(false);
  
  useEffect(() => {
    if (userData?.users?.[0]) {
      setUser(userData.users[0]);
      setPositions(userData.positions || []);
    } else if (session?.user?.id && !userDataLoading && !initAttempted) {
      setInitAttempted(true);
      
      // Initialize user via API (server-side with Admin SDK)
      fetch("/api/user/init", { method: "POST" })
        .then(() => console.log("✅ User init triggered (Admin SDK)"))
        .catch(err => console.error("❌ User init error:", err));
    }
  }, [userData, session, userDataLoading, initAttempted]);

  // Fetch position when symbol changes
  const { data: positionData } = db.useQuery(
    session?.user?.id && symbol
      ? {
          positions: {
            $: {
              where: {
                userId: session.user.id,
                symbol: symbol.toUpperCase(),
              },
            },
          },
        }
      : null
  );

  useEffect(() => {
    if (positionData) {
      setPosition(positionData.positions?.[0] || null);
    } else if (symbol && positions.length > 0) {
      // Fallback: find position in already loaded positions
      const found = positions.find(p => p.symbol === symbol.toUpperCase());
      setPosition(found || null);
    }
  }, [positionData, symbol, positions]);

  // Check if user can sell (for button disabled state)
  const canSell = () => {
    if (tradeType !== "SELL") return true;
    if (!symbol) return false;
    const currentPos = positions.find(p => p.symbol === symbol.toUpperCase());
    return currentPos && currentPos.quantity > 0;
  };

  const fetchPrice = async () => {
    if (!symbol) return;

    setLoading(true);
    try {
      const simDate = isSimulationMode && simulationDate
        ? (simulationDate instanceof Date ? simulationDate : new Date(simulationDate))
        : null;
      const dateParam = simDate
        ? `&date=${simDate.toISOString().split('T')[0]}`
        : '';
      const response = await fetch(`/api/stocks/quote?symbol=${symbol}${dateParam}`);
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        // Use fallback price when API fails
        setCurrentPrice(100); // Default mock price for demo
      } else {
        setCurrentPrice(data.price);
      }

      // Fetch historical data for chart
      const historyResponse = await fetch(`/api/stocks/history?symbol=${symbol}&outputsize=30`);
      const historyData = await historyResponse.json();
      if (historyData.values) {
        setPriceHistory(historyData.values);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Price fetch error:", error);
      toast.error("Using estimated price. Real-time data unavailable.");
      // Use fallback price on network error
      setCurrentPrice(100); // Default mock price for demo
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (symbol.length >= 1) {
      const timer = setTimeout(() => {
        fetchPrice();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setCurrentPrice(null);
    }
  }, [symbol, simulationDate, isSimulationMode]);

  const calculateTotal = () => {
    if (!currentPrice) return 0;

    if (inputType === "amount" && amount) {
      return parseFloat(amount);
    } else if (inputType === "shares" && shares) {
      return parseFloat(shares) * currentPrice;
    }

    return 0;
  };

  const calculateShares = () => {
    if (!currentPrice) return 0;

    if (inputType === "amount" && amount) {
      return parseFloat(amount) / currentPrice;
    } else if (inputType === "shares" && shares) {
      return parseFloat(shares);
    }

    return 0;
  };

  const executeTrade = async () => {
    if (!symbol || (!amount && !shares)) {
      toast.error("Please fill in all fields");
      return;
    }

    // If price not loaded, fetch it now
    if (!currentPrice) {
      console.log("⚠️ Price not loaded, fetching now...");
      try {
        setLoading(true);
        const dateParam = isSimulationMode && simulationDate
          ? `&date=${simulationDate.toISOString().split('T')[0]}`
          : '';
        const response = await fetch(`/api/stocks/quote?symbol=${symbol}${dateParam}`);
        const data = await response.json();

        if (data.error || !data.price) {
          console.log("❌ Price fetch failed, using fallback 100");
          setCurrentPrice(100);
        } else {
          console.log("✅ Price fetched:", data.price);
          setCurrentPrice(data.price);
        }
      } catch (error) {
        console.error("❌ Price fetch error:", error);
        setCurrentPrice(100);
      } finally {
        setLoading(false);
      }
    }

    // Use fallback price if not available
    const tradePrice = currentPrice || 100;
    
    const quantity = inputType === "amount" && amount
      ? parseFloat(amount) / tradePrice
      : parseFloat(shares || "0");
    const total = quantity * tradePrice;

    if (quantity <= 0) {
      toast.error("Invalid quantity");
      return;
    }

    if (!user) {
      toast.error("User not loaded");
      return;
    }

    if (tradeType === "BUY" && user.currentCash < total) {
      toast.error("Insufficient funds");
      return;
    }

    if (tradeType === "SELL" && (!position || position.quantity < quantity)) {
      toast.error("Insufficient shares");
      return;
    }

    setExecuting(true);
    try {
      const response = await fetch("/api/trades/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          type: tradeType,
          quantity,
          pricePerShare: tradePrice,
          simulationDate: isSimulationMode && simulationDate
            ? simulationDate.toISOString()
            : new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        console.log("✅ Trade SUCCESS! Server updated DB.");
        console.log("New Cash from API:", data.newCash);
        
        // Show success message
        toast.success(`Trade executed! ${tradeType === "BUY" ? "Bought" : "Sold"} ${quantity.toFixed(4)} ${symbol} shares`);
        
        // Clear inputs
        setAmount("");
        setShares("");
        
        // FORCE REFRESH InstantDB data by triggering state change
        console.log("🔄 Force refreshing InstantDB...");
        setTimeout(() => {
          setRefetchTrigger(prev => prev + 1); // Trigger re-fetch
          console.log("✅ Data refetch triggered!");
        }, 500);
      }
    } catch (error) {
      console.error("Trade execution error:", error);
      toast.error("Failed to execute trade");
    } finally {
      setExecuting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const allPositions = userData?.positions || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{t("trade.title")}</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("portfolio.cash")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user ? formatCurrency(user.currentCash) : "—"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allPositions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user ? formatCurrency(user.currentCash + allPositions.reduce((sum: number, p: any) => sum + (p.quantity * p.avgCostPerShare), 0)) : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {allPositions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allPositions.map((pos: any) => (
                <div key={pos.id} className="flex justify-between items-center p-3 bg-accent rounded-lg">
                  <div>
                    <div className="font-semibold">{pos.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {pos.quantity.toFixed(4)} shares @ {formatCurrency(pos.avgCostPerShare)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(pos.quantity * pos.avgCostPerShare)}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSymbol(pos.symbol);
                        setTradeType("SELL");
                      }}
                    >
                      Trade
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("trade.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as "BUY" | "SELL")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="BUY">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t("trade.buy")}
              </TabsTrigger>
              <TabsTrigger value="SELL">
                <TrendingDown className="h-4 w-4 mr-2" />
                {t("trade.sell")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label>{t("trade.symbol")}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("trade.enterSymbol")}
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="pl-10"
              />
              {loading && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {currentPrice && (
            <div className="space-y-4">
              <div className="p-4 bg-accent rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("trade.currentPrice")}</span>
                  <span className="text-2xl font-bold">{formatCurrency(currentPrice)}</span>
                </div>
                {lastUpdated && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Clock className="h-3 w-3" />
                    Last updated: {format(lastUpdated, "PPp")}
                  </div>
                )}
              </div>

              {priceHistory.length > 0 && (
                <PriceChart data={priceHistory} symbol={symbol} />
              )}

              <AICommentary 
                symbol={symbol} 
                priceData={priceHistory}
                currentPrice={currentPrice}
              />
            </div>
          )}

          <Tabs value={inputType} onValueChange={(v) => setInputType(v as "amount" | "shares")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="amount">
                {t("trade.amount")} (EUR)
              </TabsTrigger>
              <TabsTrigger value="shares">
                {t("trade.shares")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="amount" className="space-y-2 mt-4">
              <Label>{t("trade.amount")}</Label>
              <Input
                type="number"
                placeholder={t("trade.enterAmount")}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
              />
            </TabsContent>

            <TabsContent value="shares" className="space-y-2 mt-4">
              <Label>{t("trade.shares")}</Label>
              <Input
                type="number"
                placeholder={t("trade.enterShares")}
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                step="0.0001"
                min="0"
              />
            </TabsContent>
          </Tabs>

          {tradeType === "SELL" && !position && symbol && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You don't own any {symbol} shares to sell.
              </p>
            </div>
          )}

          {tradeType === "SELL" && position && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                You own {position.quantity.toFixed(4)} shares of {symbol}
              </p>
            </div>
          )}

          {currentPrice && (amount || shares) && (
            <div className="p-4 bg-accent rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>{t("trade.shares")}:</span>
                <span className="font-semibold">{calculateShares().toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>{t("trade.total")}:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={executeTrade}
            disabled={
              !symbol || 
              (!amount && !shares) || 
              executing || 
              loading ||
              !canSell()
            }
          >
            {executing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("trade.execute")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
