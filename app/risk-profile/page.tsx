"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { db } from "@/lib/instantdb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

type RiskProfile = "low" | "medium" | "high";

const COLORS = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

export default function RiskProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();

  const [user, setUser] = useState<any>(null);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<RiskProfile>("medium");
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Fetch user and watchlist - useQuery must be at top level
  const { data } = db.useQuery(
    session?.user?.id
      ? {
          users: {
            $: {
              where: {
                id: session.user.id,
              },
            },
          },
          watchlist: {
            $: {
              where: {
                userId: session.user.id,
              },
            },
          },
        }
      : null
  );

  useEffect(() => {
    if (data) {
      const userData = data.users?.[0];
      setUser(userData);
      setSelectedProfile(userData?.riskProfile || "medium");
      setWatchlist(data.watchlist || []);
      setLoading(false);
    }
  }, [data]);

  const calculateVolatility = async (symbol: string) => {
    try {
      const response = await fetch(`/api/stocks/time-series?symbol=${symbol}&outputsize=30`);
      const data = await response.json();

      if (!data.data || data.data.length === 0) return 0;

      const prices = data.data.map((d: any) => d.close);
      const returns = [];
      for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
      }

      const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance) * 100;

      return stdDev;
    } catch (error) {
      console.error(`Failed to calculate volatility for ${symbol}:`, error);
      return 0;
    }
  };

  const generateRecommendation = async () => {
    if (watchlist.length === 0) {
      toast.error("Add stocks to your watchlist first!");
      return;
    }

    setCalculating(true);
    try {
      const volatilities = await Promise.all(
        watchlist.map(async (item) => ({
          symbol: item.symbol,
          volatility: await calculateVolatility(item.symbol),
        }))
      );

      const sorted = volatilities.sort((a, b) => a.volatility - b.volatility);
      const lowVol = sorted.filter((_, i) => i < sorted.length / 3);
      const medVol = sorted.filter((_, i) => i >= sorted.length / 3 && i < (2 * sorted.length) / 3);
      const highVol = sorted.filter((_, i) => i >= (2 * sorted.length) / 3);

      let allocation: any[] = [];

      switch (selectedProfile) {
        case "low":
          allocation = [
            ...lowVol.map((s) => ({ ...s, allocation: 70 / lowVol.length })),
            ...medVol.map((s) => ({ ...s, allocation: 30 / medVol.length })),
          ];
          break;
        case "medium":
          allocation = [
            ...lowVol.map((s) => ({ ...s, allocation: 40 / lowVol.length })),
            ...medVol.map((s) => ({ ...s, allocation: 40 / medVol.length })),
            ...highVol.map((s) => ({ ...s, allocation: 20 / highVol.length })),
          ];
          break;
        case "high":
          allocation = [
            ...medVol.map((s) => ({ ...s, allocation: 30 / medVol.length })),
            ...highVol.map((s) => ({ ...s, allocation: 70 / highVol.length })),
          ];
          break;
      }

      setRecommendation({
        allocation: allocation.filter((a) => a.allocation > 0),
        lowVol,
        medVol,
        highVol,
      });

      toast.success("Recommendation generated!");
    } catch (error) {
      console.error("Failed to generate recommendation:", error);
      toast.error("Failed to generate recommendation");
    } finally {
      setCalculating(false);
    }
  };

  const saveRiskProfile = async () => {
    if (!session?.user?.id) return;

    try {
      await db.transact([
        db.tx.users[session.user.id].update({
          riskProfile: selectedProfile,
        }),
      ]);

      toast.success("Risk profile saved!");
    } catch (error) {
      console.error("Failed to save risk profile:", error);
      toast.error("Failed to save risk profile");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const pieData = recommendation?.allocation.map((item: any) => ({
    name: item.symbol,
    value: item.allocation,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          {t("riskProfile.title")}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("riskProfile.assessment")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-4 block">Select your risk tolerance:</Label>
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => setSelectedProfile("low")}
                className={`p-6 border-2 rounded-lg transition-all ${
                  selectedProfile === "low"
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : "border-border hover:border-green-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {t("riskProfile.low")}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("riskProfile.description.low")}
                  </p>
                </div>
              </button>

              <button
                onClick={() => setSelectedProfile("medium")}
                className={`p-6 border-2 rounded-lg transition-all ${
                  selectedProfile === "medium"
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950"
                    : "border-border hover:border-orange-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {t("riskProfile.medium")}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("riskProfile.description.medium")}
                  </p>
                </div>
              </button>

              <button
                onClick={() => setSelectedProfile("high")}
                className={`p-6 border-2 rounded-lg transition-all ${
                  selectedProfile === "high"
                    ? "border-red-500 bg-red-50 dark:bg-red-950"
                    : "border-border hover:border-red-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 mb-2">
                    {t("riskProfile.high")}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("riskProfile.description.high")}
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={saveRiskProfile} variant="outline">
              {t("common.save")} Profile
            </Button>
            <Button onClick={generateRecommendation} disabled={calculating}>
              {calculating ? "Calculating..." : "Generate Recommendation"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {recommendation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              {t("riskProfile.recommendation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">{t("riskProfile.allocation")}</h3>
                {recommendation.allocation.map((item: any) => (
                  <div key={item.symbol} className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Badge>{item.symbol}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Volatility: {item.volatility.toFixed(2)}%
                      </span>
                    </div>
                    <span className="font-semibold">{item.allocation.toFixed(1)}%</span>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-semibold mb-4">Allocation Chart</h3>
                {pieData.length > 0 && (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.name} ${entry.value.toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`hsl(${index * 360 / pieData.length}, 70%, 50%)`}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <Button className="w-full" size="lg">
              <TrendingUp className="h-4 w-4 mr-2" />
              {t("riskProfile.autoInvest")}
            </Button>
          </CardContent>
        </Card>
      )}

      {watchlist.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Add stocks to your watchlist in the Trade page to get personalized recommendations!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

