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
    const { name, startDate, endDate, startingBalance } = body;

    if (!name || !startDate || !endDate || !startingBalance) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const tournamentId = crypto.randomUUID();

    await db.transact([
      db.tx.tournaments[tournamentId].update({
        name,
        startingBalance: parseFloat(startingBalance),
        startDate: new Date(startDate).getTime(),
        endDate: new Date(endDate).getTime(),
        status: "active",
      }),
    ]);

    return NextResponse.json({
      success: true,
      tournamentId,
    });
  } catch (error) {
    console.error("Tournament creation error:", error);
    return NextResponse.json(
      { error: "Failed to create tournament" },
      { status: 500 }
    );
  }
}

