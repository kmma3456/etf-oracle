export type PortfolioHolding = {
  ticker: string;
  weightPct: number;
};

export type XRayReport = {
  portfolio: PortfolioHolding[];
  holdingsByEtf: Record<
    string,
    {
      name: string;
      symbol: string;
      weightInEtfPct: number;
      effectiveExposurePct: number;
    }[]
  >;
  overlaps: {
    symbol: string;
    name: string;
    combinedExposurePct: number;
    fromEtfs: { ticker: string; contributionPct: number }[];
  }[];
  sectorExposure: { sector: string; pct: number }[];
  disclaimer: string;
};

export type ForecastDemoResponse = {
  ticker: string;
  currentPriceAssumed: number;
  horizon: string;
  horizonDays: number;
  distributionNote: string;
  scenarios: {
    lower: { label: string; returnPct: number; probability?: number };
    central: { label: string; returnPct: number; probability?: number };
    upper: { label: string; returnPct: number; probability?: number };
  };
  risk: { drawdown10PctProbability: number };
  modelVersion: string;
  disclaimer: string;
};
