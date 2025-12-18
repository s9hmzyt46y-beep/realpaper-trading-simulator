import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol");
  const date = searchParams.get("date");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    let url = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`;
    
    // If date is provided, use time_series to get historical price
    if (date) {
      const endDate = new Date(date);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 1);
      
      url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}&apikey=${apiKey}`;
    }

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error("Failed to fetch stock data");
    }

    const data = await response.json();

    // Handle historical data response
    if (date && data.values && data.values.length > 0) {
      const historicalData = data.values[0];
      return NextResponse.json({
        symbol: symbol.toUpperCase(),
        price: parseFloat(historicalData.close),
        open: parseFloat(historicalData.open),
        high: parseFloat(historicalData.high),
        low: parseFloat(historicalData.low),
        volume: parseInt(historicalData.volume),
        datetime: historicalData.datetime,
        isHistorical: true,
      });
    }

    // Handle real-time quote
    return NextResponse.json({
      symbol: data.symbol,
      price: parseFloat(data.close || data.price),
      open: parseFloat(data.open),
      high: parseFloat(data.high),
      low: parseFloat(data.low),
      volume: parseInt(data.volume),
      change: parseFloat(data.change),
      changePercent: parseFloat(data.percent_change),
      datetime: data.datetime,
      isHistorical: false,
    });
  } catch (error) {
    console.error("Stock quote error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock quote" },
      { status: 500 }
    );
  }
}

