import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const url = `https://api.twelvedata.com/symbol_search?symbol=${query}&apikey=${apiKey}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error("Failed to search symbols");
    }

    const data = await response.json();

    return NextResponse.json({
      results: data.data || [],
    });
  } catch (error) {
    console.error("Symbol search error:", error);
    return NextResponse.json(
      { error: "Failed to search symbols" },
      { status: 500 }
    );
  }
}

