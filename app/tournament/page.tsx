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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Trophy, Plus, Users } from "lucide-react";

export default function TournamentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();

  const [tournaments, setTournaments] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    startingBalance: "10000",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Fetch tournaments data - useQuery must be at top level
  const { data } = db.useQuery(
    session?.user?.id
      ? {
          tournaments: {},
          tournamentParticipants: {},
          users: {},
        }
      : null
  );

  useEffect(() => {
    if (data) {
      setTournaments(data.tournaments || []);
      setParticipants(data.tournamentParticipants || []);
      setUsers(data.users || []);
      setLoading(false);
    }
  }, [data]);

  const createTournament = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all fields");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/tournament/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Tournament created successfully!");
        setShowCreate(false);
        setFormData({ name: "", startDate: "", endDate: "", startingBalance: "10000" });
      }
    } catch (error) {
      console.error("Tournament creation error:", error);
      toast.error("Failed to create tournament");
    } finally {
      setCreating(false);
    }
  };

  const joinTournament = async (tournamentId: string) => {
    try {
      const response = await fetch("/api/tournament/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Joined tournament successfully!");
      }
    } catch (error) {
      console.error("Tournament join error:", error);
      toast.error("Failed to join tournament");
    }
  };

  const getParticipantsForTournament = (tournamentId: string) => {
    return participants.filter((p) => p.tournamentId === tournamentId);
  };

  const isUserParticipant = (tournamentId: string) => {
    return participants.some((p) => p.tournamentId === tournamentId && p.userId === session?.user?.id);
  };

  const getTournamentStatus = (tournament: any) => {
    const now = Date.now();
    if (now < tournament.startDate) return "upcoming";
    if (now > tournament.endDate) return "completed";
    return "active";
  };

  const getLeaderboard = (tournamentId: string) => {
    const tournamentParticipants = getParticipantsForTournament(tournamentId);
    const tournament = tournaments.find((t) => t.id === tournamentId);

    if (!tournament) return [];

    return tournamentParticipants
      .map((p) => {
        const user = users.find((u) => u.id === p.userId);
        const returnPercent = tournament.startingBalance > 0
          ? ((p.currentBalance - tournament.startingBalance) / tournament.startingBalance) * 100
          : 0;

        return {
          ...p,
          username: user?.username || "Unknown",
          returnPercent,
        };
      })
      .sort((a, b) => b.returnPercent - a.returnPercent)
      .map((p, index) => ({ ...p, rank: index + 1 }));
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
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          {t("tournament.title")}
        </h1>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("tournament.create")}
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>{t("tournament.create")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("tournament.name")}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., January Challenge"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("tournament.startDate")}</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("tournament.endDate")}</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("tournament.startingBalance")}</Label>
              <Input
                type="number"
                value={formData.startingBalance}
                onChange={(e) => setFormData({ ...formData, startingBalance: e.target.value })}
              />
            </div>

            <Button onClick={createTournament} disabled={creating} className="w-full">
              {creating ? "Creating..." : t("tournament.create")}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {tournaments.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No tournaments yet. Create one to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          tournaments.map((tournament) => {
            const status = getTournamentStatus(tournament);
            const participantList = getParticipantsForTournament(tournament.id);
            const isParticipant = isUserParticipant(tournament.id);
            const leaderboard = getLeaderboard(tournament.id);

            return (
              <Card key={tournament.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {tournament.name}
                        <Badge variant={status === "active" ? "default" : "secondary"}>
                          {t(`tournament.status.${status}`)}
                        </Badge>
                      </CardTitle>
                      <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <div>
                          {t("tournament.startDate")}: {formatDate(new Date(tournament.startDate))}
                        </div>
                        <div>
                          {t("tournament.endDate")}: {formatDate(new Date(tournament.endDate))}
                        </div>
                        <div>
                          {t("tournament.startingBalance")}: {formatCurrency(tournament.startingBalance)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Users className="h-4 w-4" />
                        {participantList.length} {t("tournament.participants")}
                      </div>
                      {!isParticipant && status !== "completed" && (
                        <Button
                          size="sm"
                          onClick={() => joinTournament(tournament.id)}
                        >
                          {t("tournament.join")}
                        </Button>
                      )}
                      {isParticipant && (
                        <Badge variant="outline">Participating</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {leaderboard.length > 0 && (
                  <CardContent>
                    <h3 className="font-semibold mb-4">{t("tournament.leaderboard")}</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">{t("tournament.rank")}</TableHead>
                          <TableHead>{t("tournament.username")}</TableHead>
                          <TableHead className="text-right">{t("tournament.return")}</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leaderboard.slice(0, 10).map((participant) => (
                          <TableRow key={participant.id}>
                            <TableCell className="font-bold">#{participant.rank}</TableCell>
                            <TableCell>{participant.username}</TableCell>
                            <TableCell className={`text-right ${participant.returnPercent >= 0 ? 'text-profit' : 'text-loss'}`}>
                              {participant.returnPercent >= 0 ? '+' : ''}{participant.returnPercent.toFixed(2)}%
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(participant.currentBalance)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

