import { NextResponse } from "next/server";
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

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id || !session.user.email) {
    return new NextResponse("Unauthorized", { status: 401 });
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
    // session.user.id is already a UUID (converted in auth callback)
    const userId = session.user.id;
    const email = session.user.email;
    const username = session.user.name || email.split("@")[0];
    
    console.log(`🔍 Initializing user with UUID: ${userId}`);

    // Check if user already exists
    const result = await db.query({
      users: {
        $: {
          where: {
            id: userId,
          },
        },
      },
    });

    // Admin SDK returns data directly, not wrapped in .data
    const existingUser = result && result.users ? result.users[0] : null;

    if (!existingUser) {
      // Create new user with initial snapshot
      await db.transact([
        db.tx.users[userId].merge({
          email,
          username,
          initialBalance: 10000,
          currentCash: 10000,
          createdAt: Date.now(),
        }),
        // Create initial portfolio snapshot
        db.tx.portfolioSnapshots[crypto.randomUUID()].update({
          userId,
          totalValue: 10000,
          cashBalance: 10000,
          positionsValue: 0,
          profitLoss: 0,
          profitLossPercent: 0,
          snapshotDate: Date.now(),
        }),
      ]);
      
      console.log(`✅ User ${userId} initialized with initial snapshot`);
    } else {
      console.log(`✅ User ${userId} already exists`);
    }

    return NextResponse.json({
      message: "User initialization successful",
      user: { id: userId, email, username },
    });
  } catch (error: any) {
    // Handle "already exists" error gracefully
    if (error?.body?.type === "record-not-unique") {
      console.log(`✅ User ${userId} already exists`);
      return NextResponse.json({
        message: "User already exists",
        user: { id: userId, email, username },
      });
    }
    
    console.error("❌ User init error:", error);
    return NextResponse.json(
      { error: "Failed to initialize user", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
