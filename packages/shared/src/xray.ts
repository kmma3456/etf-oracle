import type { PortfolioHolding, XRayReport } from "./types";

/** POC holdings for QQQ + SPY overlap demo (not live N-PORT). */
const POC_ETF_HOLDINGS: Record<
  string,
  { name: string; symbol: string; weightPct: number }[]
> = {
  QQQ: [
    { symbol: "NVDA", name: "NVIDIA", weightPct: 8.5 },
    { symbol: "AAPL", name: "Apple", weightPct: 7.5 },
    { symbol: "MSFT", name: "Microsoft", weightPct: 6.5 },
    { symbol: "AMZN", name: "Amazon", weightPct: 5.0 },
    { symbol: "META", name: "Meta", weightPct: 4.2 },
  ],
  SPY: [
    { symbol: "AAPL", name: "Apple", weightPct: 7.2 },
    { symbol: "MSFT", name: "Microsoft", weightPct: 6.8 },
    { symbol: "NVDA", name: "NVIDIA", weightPct: 6.1 },
    { symbol: "AMZN", name: "Amazon", weightPct: 3.5 },
    { symbol: "GOOGL", name: "Alphabet", weightPct: 3.2 },
  ],
};

export function buildXRayReport(holdings: PortfolioHolding[]): XRayReport {
  const normalized = holdings.filter((h) => h.weightPct > 0);
  const total = normalized.reduce((s, h) => s + h.weightPct, 0);
  const scale = total > 0 ? 100 / total : 1;

  const holdingsByEtf: XRayReport["holdingsByEtf"] = {};
  const exposureMap = new Map<
    string,
    { name: string; total: number; fromEtfs: { ticker: string; contributionPct: number }[] }
  >();

  for (const h of normalized) {
    const ticker = h.ticker.toUpperCase();
    const etfWeight = h.weightPct * scale;
    const rows = POC_ETF_HOLDINGS[ticker];

    if (!rows) {
      holdingsByEtf[ticker] = [];
      continue;
    }

    holdingsByEtf[ticker] = rows.map((r) => {
      const effective = (etfWeight * r.weightPct) / 100;
      const existing = exposureMap.get(r.symbol);
      const contribution = { ticker, contributionPct: effective };
      if (existing) {
        existing.total += effective;
        existing.fromEtfs.push(contribution);
      } else {
        exposureMap.set(r.symbol, {
          name: r.name,
          total: effective,
          fromEtfs: [contribution],
        });
      }
      return {
        name: r.name,
        symbol: r.symbol,
        weightInEtfPct: r.weightPct,
        effectiveExposurePct: Math.round(effective * 1000) / 1000,
      };
    });
  }

  const overlaps = [...exposureMap.entries()]
    .map(([symbol, v]) => ({
      symbol,
      name: v.name,
      combinedExposurePct: Math.round(v.total * 1000) / 1000,
      fromEtfs: v.fromEtfs.map((f) => ({
        ...f,
        contributionPct: Math.round(f.contributionPct * 1000) / 1000,
      })),
    }))
    .filter((o) => o.fromEtfs.length > 1 || o.combinedExposurePct >= 3)
    .sort((a, b) => b.combinedExposurePct - a.combinedExposurePct);

  const sectorExposure = [
    { sector: "Technology", pct: 42 },
    { sector: "Communication", pct: 12 },
    { sector: "Consumer Discretionary", pct: 10 },
    { sector: "Other", pct: 36 },
  ];

  return {
    portfolio: normalized.map((h) => ({
      ticker: h.ticker.toUpperCase(),
      weightPct: Math.round(h.weightPct * scale * 1000) / 1000,
    })),
    holdingsByEtf,
    overlaps,
    sectorExposure,
    disclaimer:
      "POC data for development. Replace with SEC N-PORT snapshots before production use.",
  };
}

export { POC_ETF_HOLDINGS };
