export type PortfolioHolding = {
  ticker: string;
  weightPct: number;
};

export type XRayHolding = {
  name: string;
  symbol: string;
  weightInEtfPct: number;
  effectiveExposurePct: number;
};

export type XRayOverlap = {
  symbol: string;
  name: string;
  combinedExposurePct: number;
  fromEtfs: { ticker: string; contributionPct: number }[];
};

export type XRayReport = {
  portfolio: PortfolioHolding[];
  holdingsByEtf: Record<string, XRayHolding[]>;
  overlaps: XRayOverlap[];
  sectorExposure: { sector: string; pct: number }[];
  disclaimer: string;
};

export type ForecastScenario = {
  label: string;
  returnPct: number;
  probability?: number;
};

export type ForecastDemoResponse = {
  ticker: string;
  currentPriceAssumed: number;
  horizon: string;
  horizonDays: number;
  distributionNote: string;
  scenarios: {
    lower: ForecastScenario;
    central: ForecastScenario;
    upper: ForecastScenario;
  };
  risk: {
    drawdown10PctProbability: number;
  };
  modelVersion: string;
  disclaimer: string;
};
