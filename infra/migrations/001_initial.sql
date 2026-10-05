-- ETF Oracle: core schema (Phase 1–4 foundation)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  weight_pct NUMERIC(6, 3) NOT NULL CHECK (weight_pct > 0 AND weight_pct <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (portfolio_id, ticker)
);

CREATE TABLE IF NOT EXISTS etf_holdings_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  as_of_date DATE NOT NULL,
  filed_at DATE,
  source TEXT NOT NULL DEFAULT 'nport_poc',
  holdings JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ticker, as_of_date, source)
);

CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE SET NULL,
  ticker TEXT NOT NULL,
  horizon_days INT NOT NULL,
  as_of_date DATE NOT NULL,
  model_version TEXT NOT NULL,
  input_snapshot JSONB NOT NULL,
  price_distribution JSONB NOT NULL,
  scenarios JSONB NOT NULL,
  risk_metrics JSONB NOT NULL,
  uncertainty JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_ticker_horizon ON predictions (ticker, horizon_days, as_of_date DESC);

CREATE TABLE IF NOT EXISTS prediction_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  resolved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actual_return_pct NUMERIC(12, 6),
  actual_price NUMERIC(18, 6),
  direction_hit BOOLEAN,
  interval_hit BOOLEAN,
  metrics JSONB NOT NULL DEFAULT '{}',
  UNIQUE (prediction_id)
);

CREATE TABLE IF NOT EXISTS model_audit_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  model_version TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  summary JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS fred_series_cache (
  series_id TEXT NOT NULL,
  observation_date DATE NOT NULL,
  value NUMERIC(18, 6),
  vintage_date DATE,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (series_id, observation_date, vintage_date)
);
