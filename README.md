# ETF Oracle

Autonomous ETF Intelligence Platform — monorepo bootstrap (Phase 1 shell + schema + demo quant).

## Structure

| Path | Role |
|------|------|
| `apps/dashboard` | Next.js UI — X-Ray + forecast demo |
| `apps/api` | Node API — X-Ray, proxy to quant |
| `services/quant` | Python FastAPI — `/forecast/demo` |
| `infra/` | Docker Compose (Postgres, Redis), SQL migrations |
| `pipelines/` | FRED & N-PORT POC scripts |
| `packages/shared` | Shared TypeScript types |

## Quick start

1. **Copy env**

   ```powershell
   copy .env.example .env
   ```

   Optional: set `FRED_API_KEY` for live macro POC.

2. **Infrastructure** (requires [Docker Desktop](https://www.docker.com/products/docker-desktop/))

   ```powershell
   npm run docker:up
   npm install
   npm run db:migrate
   ```

   If `docker` is not installed, skip this step until Docker is available — the UI and APIs run without Postgres for now.

3. **Run services** (three terminals)

   ```powershell
   npm run dev:quant
   npm run dev:api
   npm run dev:dashboard
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

5. **Data POC**

   ```powershell
   npm run pipeline:nport
   npm run pipeline:fred
   ```

## API

- `GET http://localhost:3001/health`
- `POST http://localhost:3001/api/xray` — body `{ "holdings": [{ "ticker": "QQQ", "weightPct": 50 }] }`
- `GET http://localhost:3001/api/forecast/demo?ticker=QQQ&horizon=6m`
- `GET http://localhost:8000/forecast/demo` — quant service direct

## Python venv (quant + pipelines)

```powershell
cd services\quant
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install -r ..\..\pipelines\requirements.txt
```

(`pipelines` uses the same deps as quant for `httpx` / `dotenv`.)

## Next steps (roadmap)

- Wire N-PORT bulk parser → `etf_holdings_snapshots`
- Persist predictions → `predictions` / `prediction_outcomes`
- LangGraph agents in `apps/api`

**Disclaimer:** Demo data and virtual forecasts only — not investment advice.
