"""FRED API POC — fetch series when FRED_API_KEY is set."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

FRED_KEY = os.getenv("FRED_API_KEY", "")
SERIES = ["DGS10", "UNRATE", "CPIAUCSL"]
OUT = Path(__file__).resolve().parents[1] / "data" / "cache" / "fred_poc.json"


def fetch_series(series_id: str, limit: int = 24) -> list[dict]:
    url = "https://api.stlouisfed.org/fred/series/observations"
    params = {
        "series_id": series_id,
        "api_key": FRED_KEY,
        "file_type": "json",
        "sort_order": "desc",
        "limit": limit,
    }
    r = httpx.get(url, params=params, timeout=30.0)
    r.raise_for_status()
    obs = r.json().get("observations", [])
    return [
        {"date": o["date"], "value": o["value"]}
        for o in obs
        if o.get("value") not in (".", None, "")
    ]


def main() -> int:
    OUT.parent.mkdir(parents=True, exist_ok=True)

    if not FRED_KEY:
        sample = {
            "status": "skipped",
            "reason": "Set FRED_API_KEY in .env (see .env.example)",
            "series": SERIES,
        }
        OUT.write_text(json.dumps(sample, indent=2), encoding="utf-8")
        print(json.dumps(sample, indent=2))
        return 0

    result: dict = {"status": "ok", "series": {}}
    for sid in SERIES:
        result["series"][sid] = fetch_series(sid)
        print(f"Fetched {sid}: {len(result['series'][sid])} observations")

    OUT.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"Wrote {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
