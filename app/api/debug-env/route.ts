import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_INSTANT_APP_ID: process.env.NEXT_PUBLIC_INSTANT_APP_ID || "NOT_SET",
    INSTANT_ADMIN_TOKEN: process.env.INSTANT_ADMIN_TOKEN 
      ? `${process.env.INSTANT_ADMIN_TOKEN.substring(0, 10)}...` 
      : "NOT_SET",
    TWELVE_DATA_API_KEY: process.env.TWELVE_DATA_API_KEY 
      ? `${process.env.TWELVE_DATA_API_KEY.substring(0, 10)}...` 
      : "NOT_SET",
    NODE_ENV: process.env.NODE_ENV,
  });
}

