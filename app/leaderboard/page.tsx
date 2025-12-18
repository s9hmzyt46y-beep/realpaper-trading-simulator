"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { db } from "@/lib/instantdb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Trophy, Medal, Award } from "lucide-react";

type Period = "today" | "week" | "month" | "allTime";

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();

  const [users, setUsers] = useState<any[]>([]);
  const [period, setPeriod] = useState<Period>("allTime");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Fetch users - useQuery must be at top level
  const { data } = db.useQuery(
    session?.user?.id
      ? {
          users: {},
        }
      : null
  );

  useEffect(() => {
    if (data) {
      setUsers(data.users || []);
      setLoading(false);
    }
  }, [data]);

  const calculateReturn = (user: any) => {
    if (!user.initialBalance || user.initialBalance === 0) return 0;
    
    // Note: In real app, we'd fetch current positions value
    // For now, using cash + initial cost as approximation
    const totalValue = user.currentCash;
    return ((totalValue - user.initialBalance) / user.initialBalance) * 100;
  };

  const getFilteredUsers = () => {
    // In a real app, we'd filter by actual trading activity date
    // For now, showing all users
    return users
      .map((user) => ({
        ...user,
        returnPercent: calculateReturn(user),
        totalValue: user.currentCash, // Simplified
      }))
      .sort((a, b) => b.returnPercent - a.returnPercent)
      .map((user, index) => ({ ...user, rank: index + 1 }));
  };

  const leaderboard = getFilteredUsers();
  const currentUserRank = leaderboard.find((u) => u.id === session?.user?.id);

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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-700" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("leaderboard.title")}</h1>
      </div>

      {currentUserRank && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Rank</p>
                <p className="text-3xl font-bold flex items-center gap-2">
                  #{currentUserRank.rank}
                  {getRankIcon(currentUserRank.rank)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t("leaderboard.return")}</p>
                <p className={`text-3xl font-bold ${currentUserRank.returnPercent >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {currentUserRank.returnPercent >= 0 ? '+' : ''}{currentUserRank.returnPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("leaderboard.title")}</CardTitle>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <TabsList>
                <TabsTrigger value="today">
                  {t("leaderboard.period.today")}
                </TabsTrigger>
                <TabsTrigger value="week">
                  {t("leaderboard.period.week")}
                </TabsTrigger>
                <TabsTrigger value="month">
                  {t("leaderboard.period.month")}
                </TabsTrigger>
                <TabsTrigger value="allTime">
                  {t("leaderboard.period.allTime")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users yet. Start trading to appear on the leaderboard!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{t("leaderboard.rank")}</TableHead>
                  <TableHead>{t("leaderboard.username")}</TableHead>
                  <TableHead className="text-right">{t("leaderboard.return")}</TableHead>
                  <TableHead className="text-right">{t("leaderboard.totalValue")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((user) => (
                  <TableRow
                    key={user.id}
                    className={user.id === session?.user?.id ? "bg-accent" : ""}
                  >
                    <TableCell className="font-bold flex items-center gap-2">
                      #{user.rank}
                      {getRankIcon(user.rank)}
                    </TableCell>
                    <TableCell>
                      {user.username}
                      {user.id === session?.user?.id && (
                        <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                      )}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${user.returnPercent >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {user.returnPercent >= 0 ? '+' : ''}{user.returnPercent.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(user.totalValue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

