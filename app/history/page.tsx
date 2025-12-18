"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import PriceChart from "@/components/charts/PriceChart";
import PortfolioChart from "@/components/charts/PortfolioChart";
import PLChart from "@/components/charts/PLChart";
import { Download } from "lucide-react";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();

  const [trades, setTrades] = useState<any[]>([]);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [filterSymbol, setFilterSymbol] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [priceData, setPriceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Fetch trades and snapshots - useQuery must be at top level
  const { data } = db.useQuery(
    session?.user?.id
      ? {
          trades: {
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
      : null
  );

  useEffect(() => {
    if (data) {
      setTrades(data.trades || []);
      setSnapshots(data.portfolioSnapshots || []);
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    const fetchPriceData = async () => {
      if (!selectedSymbol) return;

      try {
        const response = await fetch(`/api/stocks/time-series?symbol=${selectedSymbol}&outputsize=30`);
        const data = await response.json();
        setPriceData(data.data || []);
      } catch (error) {
        console.error("Failed to fetch price data:", error);
      }
    };

    fetchPriceData();
  }, [selectedSymbol]);

  const filteredTrades = trades.filter((trade) =>
    filterSymbol ? trade.symbol.includes(filterSymbol.toUpperCase()) : true
  ).sort((a, b) => b.tradeDate - a.tradeDate);

  const exportToCSV = () => {
    const headers = ["Date", "Symbol", "Type", "Quantity", "Price", "Total", "Simulation Date"];
    const rows = filteredTrades.map((trade) => [
      new Date(trade.tradeDate).toISOString(),
      trade.symbol,
      trade.type,
      trade.quantity,
      trade.pricePerShare,
      trade.totalAmount,
      new Date(trade.simulationDate).toISOString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trades_${new Date().toISOString()}.csv`;
    link.click();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("history.title")}</h1>
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          {t("common.export")}
        </Button>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">{t("history.charts")}</h2>

        <div className="space-y-2">
          <Label>Select Symbol for Price Chart</Label>
          <Input
            placeholder="Enter symbol (e.g., AAPL)"
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
            className="max-w-xs"
          />
        </div>

        {priceData.length > 0 && (
          <PriceChart data={priceData} symbol={selectedSymbol} />
        )}

        {snapshots.length > 0 ? (
          <>
            <PortfolioChart data={snapshots} />
            <PLChart data={snapshots} />
          </>
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No portfolio history yet. Trade more to see your performance over time!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("history.title")}</CardTitle>
            <div className="w-64">
              <Input
                placeholder={t("common.filter") + " by symbol"}
                value={filterSymbol}
                onChange={(e) => setFilterSymbol(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTrades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No trades yet. Start trading to see your history!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("history.date")}</TableHead>
                  <TableHead>{t("history.symbol")}</TableHead>
                  <TableHead>{t("history.type")}</TableHead>
                  <TableHead className="text-right">{t("history.quantity")}</TableHead>
                  <TableHead className="text-right">{t("history.price")}</TableHead>
                  <TableHead className="text-right">{t("history.total")}</TableHead>
                  <TableHead>{t("history.simulationDate")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell>{formatDateTime(new Date(trade.tradeDate))}</TableCell>
                    <TableCell className="font-medium">{trade.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={trade.type === "BUY" ? "default" : "secondary"}>
                        {trade.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{trade.quantity.toFixed(4)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(trade.pricePerShare)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(trade.totalAmount)}</TableCell>
                    <TableCell>{formatDateTime(new Date(trade.simulationDate))}</TableCell>
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

