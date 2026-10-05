"""Illustrative probabilistic forecast — not investment advice."""

from __future__ import annotations

import hashlib
from typing import Any

HORIZON_DAYS = {"1m": 21, "3m": 63, "6m": 126, "1y": 252}

# Demo assumptions per ticker (POC only)
BASE = {
    "QQQ": {"price": 600.0, "vol": 0.22},
    "SPY": {"price": 580.0, "vol": 0.16},
}


def demo_forecast(ticker: str, horizon: str) -> dict[str, Any]:
    cfg = BASE.get(ticker, {"price": 100.0, "vol": 0.18})
    days = HORIZON_DAYS[horizon]
    vol_scale = (days / 252) ** 0.5
    sigma = cfg["vol"] * vol_scale

    # Fixed demo scenarios (aligned with product spec illustration)
    scenarios = {
        "lower": {"label": "하단 시나리오", "returnPct": -18, "probability": 0.15},
        "central": {"label": "중앙 시나리오", "returnPct": 7, "probability": 0.55},
        "upper": {"label": "상단 시나리오", "returnPct": 23, "probability": 0.15},
    }

    seed = hashlib.sha256(f"{ticker}:{horizon}".encode()).hexdigest()[:8]
    model_version = f"demo-mc-v0.1-{seed}"

    return {
        "ticker": ticker,
        "currentPriceAssumed": cfg["price"],
        "horizon": horizon,
        "horizonDays": days,
        "distributionNote": (
            "Monte Carlo–style demo bands; replace with trained ensemble in Phase 2."
        ),
        "priceDistribution": {
            "bins": [
                {"rangePct": [-30, -10], "probability": 0.12},
                {"rangePct": [-10, 0], "probability": 0.28},
                {"rangePct": [0, 10], "probability": 0.35},
                {"rangePct": [10, 30], "probability": 0.18},
                {"rangePct": [30, 50], "probability": 0.07},
            ],
            "impliedVolAnnualized": round(cfg["vol"], 4),
            "horizonSigma": round(sigma, 4),
        },
        "scenarios": scenarios,
        "risk": {
            "drawdown10PctProbability": round(min(0.85, 0.35 + sigma * 1.2), 3),
        },
        "modelVersion": model_version,
        "disclaimer": "Virtual forecast for UI demo — not actual ETF prices or predictions.",
    }
