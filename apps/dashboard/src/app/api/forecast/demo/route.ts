import { NextRequest, NextResponse } from "next/server";

const QUANT_URL = process.env.QUANT_SERVICE_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const ticker = searchParams.get("ticker") ?? "QQQ";
  const horizon = searchParams.get("horizon") ?? "6m";
  const url = `${QUANT_URL}/forecast/demo?ticker=${encodeURIComponent(ticker)}&horizon=${encodeURIComponent(horizon)}`;

  try {
    const r = await fetch(url, { next: { revalidate: 0 } });
    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch {
    return NextResponse.json(
      {
        error: "Quant service unavailable",
        hint: "Run npm run dev:quant in another terminal",
      },
      { status: 503 }
    );
  }
}
