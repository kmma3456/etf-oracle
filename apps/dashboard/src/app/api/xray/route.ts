import type { PortfolioHolding } from "@/lib/types";
import { buildXRayReport } from "@/lib/xray";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let holdings: PortfolioHolding[] | undefined;
  try {
    const body = (await req.json()) as { holdings?: PortfolioHolding[] };
    holdings = body.holdings;
  } catch {
    holdings = undefined;
  }
  return NextResponse.json(
    buildXRayReport(
      holdings ?? [
        { ticker: "QQQ", weightPct: 50 },
        { ticker: "SPY", weightPct: 50 },
      ]
    )
  );
}
