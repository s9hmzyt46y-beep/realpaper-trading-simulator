import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { init } from "@instantdb/admin";

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || "";
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN || "";

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Get user's current data
    const result = await db.query({
      users: {
        $: {
          where: {
            id: userId,
          },
        },
      },
      positions: {
        $: {
          where: {
            userId: userId,
          },
        },
      },
    });

    const user = result?.users?.[0];
    const positions = result?.positions || [];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create historical snapshots (last 7 days)
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const snapshots = [];

    // Calculate current positions value
    const currentPositionsValue = positions.reduce((sum: number, p: any) => {
      return sum + (p.quantity * p.avgCostPerShare);
    }, 0);

    for (let i = 7; i >= 0; i--) {
      const snapshotDate = now - (i * oneDayMs);
      const totalValue = user.initialBalance - (i * 100); // Simulate gradual loss
      const cashBalance = user.currentCash;
      const positionsValue = i === 0 ? currentPositionsValue : totalValue - cashBalance;
      const profitLoss = totalValue - user.initialBalance;
      const profitLossPercent = (profitLoss / user.initialBalance) * 100;

      snapshots.push(
        db.tx.portfolioSnapshots[crypto.randomUUID()].update({
          userId,
          totalValue,
          cashBalance,
          positionsValue,
          profitLoss,
          profitLossPercent,
          snapshotDate,
        })
      );
    }

    await db.transact(snapshots);

    return NextResponse.json({
      success: true,
      message: `Created ${snapshots.length} portfolio snapshots`,
    });
  } catch (error: any) {
    console.error("Create snapshots error:", error);
    return NextResponse.json(
      { error: "Failed to create snapshots", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

