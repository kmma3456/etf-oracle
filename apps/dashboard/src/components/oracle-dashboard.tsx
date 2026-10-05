"use client";

import { useCallback, useEffect, useState } from "react";
import type { ForecastDemoResponse, PortfolioHolding, XRayReport } from "@/lib/types";

/** Same-origin Next.js routes — works with only `npm run dev:dashboard`. */
const API = process.env.NEXT_PUBLIC_API_URL?.trim() || "";

type Horizon = "1m" | "3m" | "6m" | "1y";

export function OracleDashboard() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([
    { ticker: "QQQ", weightPct: 50 },
    { ticker: "SPY", weightPct: 50 },
  ]);
  const [xray, setXray] = useState<XRayReport | null>(null);
  const [forecast, setForecast] = useState<ForecastDemoResponse | null>(null);
  const [horizon, setHorizon] = useState<Horizon>("6m");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState<Date | null>(null);
  const [pulse, setPulse] = useState(false);

  const loadXray = useCallback(async () => {
    const xRes = await fetch(`${API}/api/xray`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ holdings }),
    });
    if (!xRes.ok) throw new Error("X-Ray failed — check the dev server console.");
    setXray(await xRes.json());
  }, [holdings]);

  const loadForecast = useCallback(async () => {
    setForecastError(null);
    const fRes = await fetch(`${API}/api/forecast/demo?ticker=QQQ&horizon=${horizon}`);
    if (!fRes.ok) {
      const body = await fRes.json().catch(() => ({}));
      setForecast(null);
      setForecastError(
        (body as { hint?: string }).hint ?? "Prediction demo unavailable (start Quant on :8000)."
      );
      return;
    }
    setForecast(await fRes.json());
  }, [horizon]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loadXray();
      setAnalyzedAt(new Date());
      setPulse(true);
      window.setTimeout(() => setPulse(false), 1200);
      document.getElementById("xray-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [loadXray]);

  useEffect(() => {
    void loadForecast();
  }, [loadForecast]);

  const updateRow = (index: number, field: "ticker" | "weightPct", value: string) => {
    setHoldings((prev) =>
      prev.map((h, i) =>
        i === index
          ? {
              ...h,
              [field]: field === "weightPct" ? Number(value) || 0 : value.toUpperCase(),
            }
          : h
      )
    );
  };

  const addRow = () => setHoldings((p) => [...p, { ticker: "VTI", weightPct: 0 }]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <header className="space-y-2 border-b border-[var(--border)] pb-6">
        <p className="text-sm text-[var(--muted)] tracking-widest uppercase">
          Autonomous ETF Intelligence Platform
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">ETF Oracle</h1>
        <p className="text-[var(--muted)] max-w-2xl">
          Phase 1 X-Ray + demo prediction engine. Research terminal — not investment advice.
        </p>
        <p className="text-xs text-[var(--muted)]">
          <strong className="text-[var(--text)] font-normal">Run X-Ray</strong> 클릭 후 아래로 스크롤되며
          중복 종목·섹터 노출이 표시됩니다. (POC: QQQ, SPY 등)
        </p>
      </header>

      <section className="panel p-5 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-medium">Portfolio input</h2>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded bg-[var(--accent)]/20 px-4 py-2 text-sm text-[var(--accent)] border border-[var(--accent)]/40 hover:bg-[var(--accent)]/30 disabled:opacity-50"
          >
            {loading ? "Analyzing…" : "Run X-Ray"}
          </button>
        </div>
        {analyzedAt && !loading && (
          <p className="text-xs text-[var(--accent)]">
            X-Ray 완료 · {analyzedAt.toLocaleTimeString("ko-KR")} · 종목 {xray?.overlaps.length ?? 0}개 노출
          </p>
        )}
        {!xray && !loading && !error && (
          <p className="text-sm text-[var(--muted)]">포트폴리오 입력 후 Run X-Ray를 눌러 분석을 시작하세요.</p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[var(--muted)] text-left">
              <tr>
                <th className="pb-2 pr-4">ETF</th>
                <th className="pb-2">Weight %</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => (
                <tr key={i} className="border-t border-[var(--border)]">
                  <td className="py-2 pr-4">
                    <input
                      className="bg-transparent border border-[var(--border)] rounded px-2 py-1 w-24 font-mono"
                      value={h.ticker}
                      onChange={(e) => updateRow(i, "ticker", e.target.value)}
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      className="bg-transparent border border-[var(--border)] rounded px-2 py-1 w-24 font-mono"
                      value={h.weightPct}
                      onChange={(e) => updateRow(i, "weightPct", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={addRow} className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
          + Add ETF
        </button>
        {error && <p className="text-[var(--danger)] text-sm">{error}</p>}
      </section>

      {loading && !xray && (
        <section className="panel p-5 animate-pulse text-sm text-[var(--muted)]">X-Ray 분석 중…</section>
      )}

      {xray && (
        <section
          id="xray-results"
          className={`grid lg:grid-cols-2 gap-6 scroll-mt-6 transition-shadow duration-500 ${
            pulse ? "ring-2 ring-[var(--accent)]/50 rounded-lg" : ""
          }`}
        >
          <div className="panel p-5 space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium">ETF X-Ray</h2>
              <span className="badge">Overlap</span>
            </div>
            <p className="text-xs text-[var(--muted)]">{xray.disclaimer}</p>
            <h3 className="text-sm text-[var(--muted)]">실질 노출 (중복 합산)</h3>
            <ul className="space-y-2">
              {xray.overlaps.length === 0 ? (
                <li className="text-sm text-[var(--muted)]">
                  No overlap data — use POC tickers QQQ / SPY or add weights &gt; 0.
                </li>
              ) : (
                xray.overlaps.slice(0, 8).map((o) => (
                  <li key={o.symbol} className="flex justify-between text-sm font-mono">
                    <span>
                      {o.symbol}{" "}
                      <span className="text-[var(--muted)] font-sans">{o.name}</span>
                    </span>
                    <span className="text-[var(--accent)]">{o.combinedExposurePct}%</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="panel p-5 space-y-4">
            <h2 className="text-lg font-medium">Sector exposure (POC)</h2>
            <div className="space-y-3">
              {xray.sectorExposure.map((s) => (
                <div key={s.sector}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{s.sector}</span>
                    <span className="font-mono">{s.pct}%</span>
                  </div>
                  <div className="h-2 rounded bg-[var(--border)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)]/70"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="panel p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h2 className="text-lg font-medium">Prediction Engine (demo)</h2>
            <p className="text-xs text-[var(--muted)]">QQQ · assumed price · virtual forecast</p>
          </div>
          <div className="flex gap-2">
            {(["1m", "3m", "6m", "1y"] as Horizon[]).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHorizon(h)}
                className={`px-3 py-1 rounded text-sm font-mono border ${
                  horizon === h
                    ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)] text-[var(--muted)]"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {forecast && (
          <>
            <div className="grid sm:grid-cols-3 gap-4">
              {(["lower", "central", "upper"] as const).map((key) => {
                const s = forecast.scenarios[key];
                const color =
                  s.returnPct < 0 ? "text-[var(--danger)]" : "text-[var(--accent)]";
                return (
                  <div key={key} className="rounded border border-[var(--border)] p-4">
                    <p className="text-xs text-[var(--muted)]">{s.label}</p>
                    <p className={`text-2xl font-mono mt-1 ${color}`}>
                      {s.returnPct > 0 ? "+" : ""}
                      {s.returnPct}%
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-[var(--muted)]">
              {forecast.disclaimer} · {forecast.modelVersion}
            </p>
          </>
        )}
        {forecastError && !forecast && (
          <p className="text-sm text-[var(--warn)]">{forecastError}</p>
        )}
      </section>
    </div>
  );
}
