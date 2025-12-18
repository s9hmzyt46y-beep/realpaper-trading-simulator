import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/instantdb";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { tournamentId } = body;

    if (!tournamentId) {
      return NextResponse.json(
        { error: "Tournament ID required" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Check if already joined
    const { data } = await db.queryOnce({
      tournamentParticipants: {
        $: {
          where: {
            tournamentId,
            userId,
          },
        },
      },
      tournaments: {
        $: {
          where: {
            id: tournamentId,
          },
        },
      },
    });

    if (data.tournamentParticipants && data.tournamentParticipants.length > 0) {
      return NextResponse.json(
        { error: "Already joined this tournament" },
        { status: 400 }
      );
    }

    const tournament = data.tournaments?.[0];
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    await db.transact([
      db.tx.tournamentParticipants[crypto.randomUUID()].update({
        tournamentId,
        userId,
        currentBalance: tournament.startingBalance,
      }),
    ]);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Tournament join error:", error);
    return NextResponse.json(
      { error: "Failed to join tournament" },
      { status: 500 }
    );
  }
}

