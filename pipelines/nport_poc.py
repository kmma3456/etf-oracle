"""
SEC Form N-PORT POC — documents structure + seeds demo snapshot for QQQ.

Full N-PORT bulk files are large; this script:
1. Explains download URL
2. Writes a normalized JSON snapshot compatible with etf_holdings_snapshots.holdings
"""

from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path

SEC_NPORT_INFO = "https://www.sec.gov/data-research/sec-markets-data/form-n-port-data-sets"

QQQ_POC_HOLDINGS = [
    {"symbol": "NVDA", "name": "NVIDIA Corp", "weightPct": 8.5, "cusip": "67066G104"},
    {"symbol": "AAPL", "name": "Apple Inc", "weightPct": 7.5, "cusip": "037833100"},
    {"symbol": "MSFT", "name": "Microsoft Corp", "weightPct": 6.5, "cusip": "594918104"},
    {"symbol": "AMZN", "name": "Amazon.com Inc", "weightPct": 5.0, "cusip": "023135106"},
    {"symbol": "META", "name": "Meta Platforms Inc", "weightPct": 4.2, "cusip": "30303M102"},
]

OUT_DIR = Path(__file__).resolve().parents[1] / "data" / "raw" / "nport"
SNAPSHOT = {
    "ticker": "QQQ",
    "asOfDate": "2025-06-30",
    "filedAt": "2025-08-15",
    "source": "nport_poc",
    "secDatasetUrl": SEC_NPORT_INFO,
    "holdings": QQQ_POC_HOLDINGS,
    "note": "POC placeholder until bulk N-PORT parser is wired (watch filed vs as-of dates).",
}


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / "QQQ_snapshot_poc.json"
    path.write_text(json.dumps(SNAPSHOT, indent=2), encoding="utf-8")
    print(f"SEC N-PORT datasets: {SEC_NPORT_INFO}")
    print(f"Wrote {path}")
    print("Next: parse official TSV/XML from SEC bulk zip into etf_holdings_snapshots.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
