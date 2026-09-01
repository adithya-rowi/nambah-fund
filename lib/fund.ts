// Server-only fund logic. NEVER import this from a client component — it holds
// the full member roster (all balances + PIN hashes).
import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import fundData from "@/data/fundData.json";

export type Member = {
  name: string;
  full_name: string;
  role: string;
  pin_hash: string;
  contribution: number;
  units: number;
  share_value: number;
  gain: number;
  return_pct: number;
  monthly: Record<string, number>;
};

type FundData = typeof fundData & { members: Member[] };
const data = fundData as unknown as FundData;

// ---- Shared, non-private fund data any logged-in member may see ----
export function publicFund() {
  const f = data.fund;
  return {
    name: f.name,
    broker: f.broker,
    fund_manager: f.fund_manager,
    start_date: f.start_date,
    data_as_of: f.data_as_of,
    total_members: f.total_members,
    current_nav: f.current_nav,
    starting_nav: f.starting_nav,
    total_portfolio: f.total_portfolio,
    total_contributions: f.total_contributions,
    total_gain: f.total_gain,
    overall_return_pct: f.overall_return_pct,
    cash: f.cash,
    stocks_value: f.stocks_value,
    mutual_funds_value: f.mutual_funds_value,
    total_realized_pl: f.total_realized_pl,
    total_trades: f.total_trades,
    nav_history: data.nav_history,
    holdings: data.holdings,
    trades: data.trades,
    months: data.months,
  };
}
export type PublicFund = ReturnType<typeof publicFund>;

const totalUnits = () =>
  data.members.reduce((sum, m) => sum + m.units, 0) || data.fund.total_units;

// A member's private view: their own numbers + their proportional slice of
// the fund's holdings/cash (holdings are fund-level, owned pro-rata by units).
export function memberView(m: Member) {
  const share = m.units / totalUnits();
  const f = data.fund;
  return {
    name: m.name,
    full_name: m.full_name,
    role: m.role,
    isAdmin: m.role === "Fund Manager",
    contribution: m.contribution,
    units: m.units,
    share_value: m.share_value,
    gain: m.gain,
    return_pct: m.return_pct,
    monthly: m.monthly,
    ownership_pct: share * 100,
    slice: {
      cash: Math.round(f.cash * share),
      holdings: data.holdings.mutual_funds
        .map((h) => ({ name: h.name, type: h.type, value: Math.round(h.nav * share) }))
        .concat(
          data.holdings.stocks.map((s: any) => ({
            name: s.name,
            type: "Stock",
            value: Math.round((s.value ?? 0) * share),
          })),
        ),
    },
  };
}
export type MemberView = ReturnType<typeof memberView>;

// ---- Auth ----
const salt = () => process.env.PIN_SALT ?? "";
const hashPin = (pin: string) =>
  createHash("sha256").update(`${salt()}:${pin}`).digest("hex");

function safeEqualHex(a: string, b: string) {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function verifyLogin(name: string, pin: string): Member | null {
  const member = data.members.find(
    (m) => m.name.toLowerCase() === name.trim().toLowerCase(),
  );
  if (!member || !member.pin_hash) return null;
  return safeEqualHex(hashPin(pin), member.pin_hash) ? member : null;
}

export function getMember(name: string): Member | null {
  return data.members.find((m) => m.name === name) ?? null;
}

// Admin-only: everyone's numbers (no PIN hashes).
export function allMembersForAdmin() {
  return data.members
    .map(({ pin_hash, ...rest }) => rest)
    .sort((a, b) => b.share_value - a.share_value);
}

// ---- Sessions: signed httpOnly cookie, HMAC via SESSION_SECRET ----
const b64u = (s: string | Buffer) =>
  Buffer.from(s).toString("base64url");
const sign = (payload: string) =>
  createHmac("sha256", process.env.SESSION_SECRET ?? "").update(payload).digest("base64url");

export function createSession(name: string, days = 30): string {
  const exp = Date.now() + days * 864e5;
  const payload = b64u(JSON.stringify({ n: name, exp }));
  return `${payload}.${sign(payload)}`;
}

export function readSession(token: string | undefined): string | null {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  const expected = sign(payload);
  if (
    sig.length !== expected.length ||
    !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  )
    return null;
  try {
    const { n, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof exp !== "number" || Date.now() > exp) return null;
    return typeof n === "string" ? n : null;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "nambah_session";
