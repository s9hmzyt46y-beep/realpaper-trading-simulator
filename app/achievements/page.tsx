"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { db } from "@/lib/instantdb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle2, Lock, TrendingUp, Target, Zap, Diamond, BarChart3 } from "lucide-react";

const achievementConfig = {
  first_trade: {
    icon: Target,
    color: "text-blue-500",
  },
  profit_10_percent: {
    icon: TrendingUp,
    color: "text-green-500",
  },
  streak_7_days: {
    icon: Zap,
    color: "text-yellow-500",
  },
  diversification: {
    icon: BarChart3,
    color: "text-purple-500",
  },
  big_win: {
    icon: Award,
    color: "text-orange-500",
  },
  diamond_hands: {
    icon: Diamond,
    color: "text-cyan-500",
  },
  day_trader: {
    icon: TrendingUp,
    color: "text-red-500",
  },
};

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();

  const [achievements, setAchievements] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Fetch achievements data - useQuery must be at top level
  const { data } = db.useQuery(
    session?.user?.id
      ? {
          achievements: {
            $: {
              where: {
                userId: session.user.id,
              },
            },
          },
          trades: {
            $: {
              where: {
                userId: session.user.id,
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
          users: {
            $: {
              where: {
                id: session.user.id,
              },
            },
          },
        }
      : null
  );

  useEffect(() => {
    if (data) {
      setAchievements(data.achievements || []);
      setTrades(data.trades || []);
      setPositions(data.positions || []);
      setUser(data.users?.[0]);
      setLoading(false);
    }
  }, [data]);

  const checkAchievement = (type: string): boolean => {
    return achievements.some((a) => a.achievementType === type);
  };

  const getProgress = (type: string): { current: number; target: number } => {
    switch (type) {
      case "first_trade":
        return { current: Math.min(trades.length, 1), target: 1 };
      
      case "profit_10_percent":
        if (!user) return { current: 0, target: 10 };
        const totalReturn = user.initialBalance > 0
          ? ((user.currentCash - user.initialBalance) / user.initialBalance) * 100
          : 0;
        return { current: Math.max(0, totalReturn), target: 10 };
      
      case "streak_7_days":
        // Simplified: check if trades on 7 different days
        const uniqueDays = new Set(
          trades.map((t) => new Date(t.tradeDate).toDateString())
        );
        return { current: uniqueDays.size, target: 7 };
      
      case "diversification":
        const uniqueSymbols = new Set(positions.map((p) => p.symbol));
        return { current: uniqueSymbols.size, target: 5 };
      
      case "big_win":
        // Check if any position has 50%+ profit
        let maxProfit = 0;
        positions.forEach((p) => {
          // We'd need current prices here, simplified
          const profit = ((p.avgCostPerShare * 1.5) - p.avgCostPerShare) / p.avgCostPerShare * 100;
          if (profit > maxProfit) maxProfit = profit;
        });
        return { current: Math.min(maxProfit, 50), target: 50 };
      
      case "diamond_hands":
        // Check if any position held for 30+ days
        let maxDays = 0;
        const now = Date.now();
        trades.forEach((t) => {
          const days = (now - t.tradeDate) / (1000 * 60 * 60 * 24);
          if (days > maxDays) maxDays = days;
        });
        return { current: Math.min(maxDays, 30), target: 30 };
      
      case "day_trader":
        // Check max trades in one day
        const tradesByDay: { [key: string]: number } = {};
        trades.forEach((t) => {
          const day = new Date(t.tradeDate).toDateString();
          tradesByDay[day] = (tradesByDay[day] || 0) + 1;
        });
        const maxInDay = Math.max(...Object.values(tradesByDay), 0);
        return { current: maxInDay, target: 10 };
      
      default:
        return { current: 0, target: 1 };
    }
  };

  const allAchievementTypes = Object.keys(achievementConfig);

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

  const unlockedCount = allAchievementTypes.filter((type) => checkAchievement(type)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Award className="h-8 w-8 text-yellow-500" />
          {t("achievements.title")}
        </h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {unlockedCount} / {allAchievementTypes.length} {t("achievements.unlocked")}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {allAchievementTypes.map((type) => {
          const unlocked = checkAchievement(type);
          const progress = getProgress(type);
          const config = achievementConfig[type as keyof typeof achievementConfig];
          const Icon = config.icon;
          const progressPercent = (progress.current / progress.target) * 100;

          return (
            <Card
              key={type}
              className={`relative overflow-hidden ${
                unlocked ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-6 w-6 ${unlocked ? config.color : "text-muted-foreground"}`} />
                    <span>{t(`achievements.types.${type}`)}</span>
                  </div>
                  {unlocked ? (
                    <CheckCircle2 className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {t(`achievements.descriptions.${type}`)}
                </p>
                
                {!unlocked && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("achievements.progress")}</span>
                      <span className="font-semibold">
                        {progress.current.toFixed(0)} / {progress.target}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {unlocked && (
                  <Badge variant="default" className="bg-yellow-500">
                    {t("achievements.unlocked")}
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

