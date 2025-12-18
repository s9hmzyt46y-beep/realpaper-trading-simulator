import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, priceData, priceChange, priceChangePercent } = body;

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Build context for AI
    const context = `
Stock Symbol: ${symbol}
Recent Price Change: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)} (${priceChangePercent > 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%)
Recent Prices: ${priceData ? priceData.slice(0, 5).map((p: any) => `${p.datetime}: €${p.close}`).join(', ') : 'N/A'}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a financial analyst providing brief, insightful commentary on stock price movements. Keep responses under 100 words, focus on the trend and potential implications.",
        },
        {
          role: "user",
          content: `Analyze this stock movement and provide a brief commentary:\n\n${context}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const commentary = completion.choices[0]?.message?.content || "No commentary available.";

    return NextResponse.json({ commentary });
  } catch (error: any) {
    console.error("AI Commentary error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate commentary",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
