import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol");
  const interval = searchParams.get("interval") || "1day";
  const outputsize = searchParams.get("outputsize") || "30";

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${apiKey}`;

    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error("Failed to fetch time series data");
    }

    const data = await response.json();

    if (data.status === "error") {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    // Transform data for easier consumption
    const timeSeries = data.values?.map((item: any) => ({
      datetime: item.datetime,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: parseInt(item.volume),
    })) || [];

    return NextResponse.json({
      symbol: data.meta?.symbol,
      interval: data.meta?.interval,
      currency: data.meta?.currency,
      data: timeSeries,
    });
  } catch (error) {
    console.error("Time series error:", error);
    return NextResponse.json(
      { error: "Failed to fetch time series data" },
      { status: 500 }
    );
  }
}

