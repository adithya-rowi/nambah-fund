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

## The core model (understand this first)
A unitized fund, like a mutual fund — see `data/fundData.json`:
- The fund has a **NAV** (value per unit). Started at 1000 on 2025-01-15; history
  is in `nav_history`.
- Each monthly contribution buys **units** at that month's NAV. A member's holding
  = `units × current NAV` = `share_value`. Early contributors get more units per
  rupiah, so per-member returns differ slightly by timing.
- **Holdings and trades are fund-level** — everyone owns them proportionally.
  A member's holdings = the fund's holdings × `member.units / total_units`.

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
