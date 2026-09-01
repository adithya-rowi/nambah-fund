# CLAUDE.md — Nambah

## What this is
Nambah is a private, **AI-first portal** for a ~14-person investment club (friends
& family, Indonesia). Members wire money monthly into one RDN account at Indo
Premier (IPOT); a fund manager trades it on IPOT; each member's stake grows via a
NAV/unit model; profits are distributed at year-end. This repo is the web app a
member logs into to see — **privately** — what their share is worth, and to ask an
AI assistant about it.

It's a friends' pooled fund, not a licensed investment company. Tone is warm and
casual; the member-facing UI is in **Bahasa Indonesia**.

## The core model (understand this first) — 2026
The app currently runs the **2026** fund year (`data/fundData.json`). Key facts:
- **Fresh start:** the 2025 fund was cashed out (paid to members) in early Jan 2026;
  2026 is a brand-new fund. A member's balance depends only on their 2026 deposits.
- **Simple proportional accounting** (`fund.model = "simple_proportional"`): each
  member's `share_value = deposits / total_deposits × current fund value`. A
  consequence: **every member has the same return %** (`overall_return_pct`).
- `member.units` is set equal to `member.contribution` (deposits), so the app's
  ownership/holdings-slice math (`units / total_units`) yields the proportional share.
- **Holdings are fund-level** — everyone owns them proportionally. A member's slice =
  fund holdings × `deposits / total_deposits`. In 2026 the fund holds **stocks**
  (BULL, BUMI, BBCA, BIPI, HUMI, JGLE) + cash; the money-market fund was redeemed.
- **Data provenance:** numbers were extracted from IPOT + BCA RDN statements in
  `data/sources/` (gitignored, financial PII). The bank-reconciled contributions
  ledger is in `data/sources/derived/`. Current NAV is exact (verified against IPOT);
  the intra-year `nav_history` curve is approximate (from monthly IPOT snapshots).
- Trades (`fund.trades`) are not yet extracted — currently empty, to be filled from
  `data/sources/2026/Trade_Conf` + `Month_Statement`.

## Stack
- Next.js (App Router) + React + TypeScript, Tailwind CSS, Recharts.
- Serverless API routes under `app/api/*` — the **only** place private data or the
  LLM key is handled.
- LLM via **OpenRouter** (default DeepSeek, model swappable by env) — `app/api/chat`.
- Live IDX prices via Yahoo Finance `.JK` tickers (delayed, free) so AI opinions
  cite real numbers instead of hallucinating them.
- Deployed on **Vercel**. In v1, data is updated by editing `data/fundData.json`
  and pushing.

## Commands
- `npm run dev` — local dev on :3000
- `npm run build` && `npm start` — production
- `npm run lint`

## Privacy — the invariant that must never break
Strict per-member privacy is the whole point of the app:
- The full roster (all members + balances) lives **server-side only**. Never
  `import fundData.json` into a client component; the browser gets data only via
  `/api/me` (member) or the admin API (manager).
- `/api/me` returns **only the logged-in member's** private figures plus shared
  fund-level data.
- `/api/chat` builds the LLM prompt from **only the caller's** data + fund-level
  public data. Another member's balance must never enter a prompt.
- PINs are stored **hashed** (salted) in the data, never plaintext. Real PINs are
  6-digit random, handed to each member once, out-of-band.
- Sessions are an httpOnly signed cookie (HMAC via Node `crypto`, `SESSION_SECRET`).
  No secrets in `localStorage`.

## Shared vs private data
- **Shared** (any logged-in member): NAV curve, total portfolio, overall return,
  holdings list, best/worst trades, fund facts.
- **Private** (only the owner, or the admin): contribution, units, share_value,
  gain, return %, monthly contribution history.

## AI assistant guardrails
- Replies in the member's language (Indonesian by default).
- Grounded in the caller's data + fund history + live prices passed into the prompt.
- May give market opinions, but every stock opinion carries a clear disclaimer
  (*bukan nasihat keuangan; harga tertunda, cek IPOT*). It must not invent prices —
  if a price wasn't provided, it says so.

## Admin (fund manager)
The manager (`role: "Fund Manager"`, Adith) gets an admin view of all members, the
leaderboard, and fund health. Admin APIs are gated by the session member's role,
**server-side**.

## Conventions
- Money is Indonesian Rupiah, integer rupiah, thousands-separated
  (`Rp 24.604.134`, no decimals). NAV/units keep 2 decimals.
- Month keys are `Jan`…`Dec` (`months` in the data).
- Source of truth: `data/fundData.json`; its shape is documented by example there.

## Env vars (server only; set in Vercel / `.env.local`, never committed)
- `OPENROUTER_API_KEY` — LLM
- `SESSION_SECRET` — session signing
- `PIN_SALT` — PIN hashing salt

## Roadmap
- **Phase 1 (now):** Indonesian member dashboard + admin view + AI chat (live
  prices, disclaimers) + PIN login, on current data, manual JSON updates. Deployable.
- **Phase 2:** IPOT import (format TBD — Excel/CSV/PDF) + market news for the AI.
- **Phase 3:** year-end distribution / payout sheet.
