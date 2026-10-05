"""ETF Oracle — Quant Engine (demo forecast)."""

from __future__ import annotations

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from app.forecast import demo_forecast

app = FastAPI(title="ETF Oracle Quant Engine", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True, "service": "etf-oracle-quant"}


@app.get("/forecast/demo")
def forecast_demo(
    ticker: str = Query("QQQ"),
    horizon: str = Query("6m", pattern="^(1m|3m|6m|1y)$"),
):
    return demo_forecast(ticker=ticker.upper(), horizon=horizon)
