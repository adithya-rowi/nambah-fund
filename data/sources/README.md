# Data sources — drop raw files here

Everything in this folder is **gitignored** (except this README) because it holds
personal financial data. Drop the raw exports here and Claude will parse them into
`data/fundData.json`. Two kinds of data are needed:

## 1. IPOT / Indo Premier — the fund's investments
Whatever you can export (best first):
- **Transaction history** (all buys/sells since 2025-01) — CSV/Excel if possible,
  else the monthly PDF e-statements. Gives us: trades, realized P/L, fees.
- **Current portfolio / holdings** — what the fund holds now (stocks + the money
  market fund) and their values.
- **Cash balance (RDN)** history if available.

Name them like: `ipot-transactions-2025.csv`, `ipot-portfolio-2025-12.pdf`, etc.

## 2. Bank RDN statement — who contributed how much, each month
- Your **monthly account statements since January 2025** (PDF or CSV) showing the
  **incoming transfers** from each member.
- We use these to reconstruct each member's monthly contribution. Heads up: bank
  statements identify a transfer by **sender name + amount**, so we'll need a
  mapping of "bank sender name → member" (some may be ambiguous — we'll flag those).

Name them like: `rdn-statement-2025-01.pdf` … `rdn-statement-2025-12.pdf`.

Once files are here, tell Claude and it will build the parser and reconcile the
numbers against the current `fundData.json`.
