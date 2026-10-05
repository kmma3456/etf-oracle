import "dotenv/config";
import cors from "cors";
import express from "express";
import type { PortfolioHolding } from "@etf-oracle/shared";
import { buildXRayReport } from "@etf-oracle/shared";

const app = express();
const PORT = Number(process.env.API_PORT || 3001);
const QUANT_URL = process.env.QUANT_SERVICE_URL || "http://localhost:8000";

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "etf-oracle-api" });
});

app.post("/api/xray", (req, res) => {
  const body = req.body as { holdings?: PortfolioHolding[] };
  const holdings = body.holdings ?? [
    { ticker: "QQQ", weightPct: 50 },
    { ticker: "SPY", weightPct: 50 },
  ];
  res.json(buildXRayReport(holdings));
});

app.get("/api/xray/demo", (_req, res) => {
  res.json(
    buildXRayReport([
      { ticker: "QQQ", weightPct: 50 },
      { ticker: "SPY", weightPct: 50 },
    ])
  );
});

app.get("/api/forecast/demo", async (req, res) => {
  const ticker = String(req.query.ticker ?? "QQQ");
  const horizon = String(req.query.horizon ?? "6m");
  const url = `${QUANT_URL}/forecast/demo?ticker=${encodeURIComponent(ticker)}&horizon=${encodeURIComponent(horizon)}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch {
    res.status(503).json({
      error: "Quant service unavailable",
      hint: "Run npm run dev:quant",
    });
  }
});

app.listen(PORT, () => {
  console.log(`ETF Oracle API http://localhost:${PORT}`);
});
