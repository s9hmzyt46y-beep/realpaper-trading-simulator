import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { init } from "@instantdb/admin";

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || "";
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN || "";

if (!APP_ID || !ADMIN_TOKEN) {
  console.error("❌ Missing INSTANT_APP_ID or INSTANT_ADMIN_TOKEN in .env.local");
}

// Use InstantDB Admin SDK for server-side writes
const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if environment variables are set
  if (!APP_ID || !ADMIN_TOKEN) {
    console.error("❌ Missing INSTANT_APP_ID or INSTANT_ADMIN_TOKEN");
    return NextResponse.json(
      { error: "Server configuration error. Please check environment variables." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { symbol, type, quantity, pricePerShare, simulationDate } = body;

    if (!symbol || !type || !quantity || !pricePerShare) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const totalAmount = quantity * pricePerShare;
    const tradeDate = Date.now();
    const simDate = simulationDate ? new Date(simulationDate).getTime() : tradeDate;

    // Get user's current cash and positions using Admin SDK
    // Admin SDK query returns data directly (not wrapped in { data: ... })
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
            symbol: symbol,
          },
        },
      },
    });

    console.log("🔍 Query result:", JSON.stringify(result).slice(0, 200));

    // Admin SDK returns data directly, not wrapped
    const data = result;
    
    if (!data || typeof data !== 'object') {
      console.error("❌ Invalid data from InstantDB query:", data);
      return NextResponse.json(
        { error: "Database query failed" },
        { status: 500 }
      );
    }

    const user = data.users?.[0];
    if (!user) {
      console.error("❌ User not found in query result");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const position = data.positions?.[0];

    // Validate trade
    if (type === "BUY") {
      if (user.currentCash < totalAmount) {
        return NextResponse.json(
          { error: "Insufficient funds" },
          { status: 400 }
        );
      }
    } else if (type === "SELL") {
      if (!position || position.quantity < quantity) {
        return NextResponse.json(
          { error: "Insufficient shares" },
          { status: 400 }
        );
      }
    }

    // Execute trade
    const newCash =
      type === "BUY"
        ? user.currentCash - totalAmount
        : user.currentCash + totalAmount;

    const transactions = [
      // Update user cash
      db.tx.users[userId].update({
        currentCash: newCash,
      }),
      // Create trade record
      db.tx.trades[crypto.randomUUID()].update({
        userId,
        symbol,
        type,
        quantity,
        pricePerShare,
        totalAmount,
        tradeDate,
        simulationDate: simDate,
      }),
    ];

    // Update position
    if (type === "BUY") {
      if (position) {
        const newQuantity = position.quantity + quantity;
        const newTotalCost = position.totalCost + totalAmount;
        const newAvgCost = newTotalCost / newQuantity;

        transactions.push(
          db.tx.positions[position.id].update({
            quantity: newQuantity,
            totalCost: newTotalCost,
            avgCostPerShare: newAvgCost,
          })
        );
      } else {
        transactions.push(
          db.tx.positions[crypto.randomUUID()].update({
            userId,
            symbol,
            quantity,
            avgCostPerShare: pricePerShare,
            totalCost: totalAmount,
          })
        );
      }
    } else if (type === "SELL" && position) {
      const newQuantity = position.quantity - quantity;
      const costReduction = (quantity / position.quantity) * position.totalCost;
      const newTotalCost = position.totalCost - costReduction;

      if (newQuantity > 0) {
        transactions.push(
          db.tx.positions[position.id].update({
            quantity: newQuantity,
            totalCost: newTotalCost,
            avgCostPerShare: newTotalCost / newQuantity,
          })
        );
      } else {
        transactions.push(db.tx.positions[position.id].delete());
      }
    }

        await db.transact(transactions);

        // Create portfolio snapshot after trade
        try {
          // Fetch all positions to calculate total portfolio value
          const allPositionsResult = await db.query({
            positions: {
              $: {
                where: {
                  userId: userId,
                },
              },
            },
          });

          const allPositions = allPositionsResult?.positions || [];
          const positionsValue = allPositions.reduce((sum: number, p: any) => {
            return sum + (p.quantity * p.avgCostPerShare);
          }, 0);
          const totalValue = newCash + positionsValue;
          const profitLoss = totalValue - 10000; // Assuming initial balance is 10000
          const profitLossPercent = (profitLoss / 10000) * 100;

          await db.transact([
            db.tx.portfolioSnapshots[crypto.randomUUID()].update({
              userId,
              totalValue,
              cashBalance: newCash,
              positionsValue,
              profitLoss,
              profitLossPercent,
              snapshotDate: Date.now(),
            }),
          ]);

          console.log("✅ Portfolio snapshot created");
        } catch (snapshotError) {
          console.error("❌ Failed to create portfolio snapshot:", snapshotError);
          // Don't fail the trade if snapshot creation fails
        }

        return NextResponse.json({
          success: true,
          newCash,
          message: "Trade executed successfully",
        });
  } catch (error) {
    console.error("Trade execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute trade" },
      { status: 500 }
    );
  }
}
