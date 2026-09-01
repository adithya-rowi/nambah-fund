// Server-only: delayed IDX quotes from Yahoo Finance (.JK tickers). Free, no key.
// Used to ground the AI so it cites real numbers instead of hallucinating prices.
import "server-only";

export type Quote = {
  ticker: string;
  price: number;
  prevClose: number;
  changePct: number;
  currency: string;
};

// Words that look like tickers but aren't; keep the extractor from grabbing them.
const STOP = new Set(["IPOT", "IDX", "NAV", "PROFIT", "SAHAM", "YANG", "SAYA", "BELI", "JUAL"]);

// Pull up to `max` candidate IDX tickers (4 uppercase letters) from free text.
export function extractTickers(text: string, max = 5): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(/\b[A-Z]{4}\b/g)) {
    const t = m[0];
    if (!STOP.has(t)) found.add(t);
    if (found.size >= max) break;
  }
  return [...found];
}

async function fetchOne(ticker: string): Promise<Quote | null> {
  const symbol = `${ticker}.JK`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NambahFund/1.0)" },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json: any = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return null;
    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    return {
      ticker,
      price,
      prevClose,
      changePct: prevClose ? ((price - prevClose) / prevClose) * 100 : 0,
      currency: meta.currency ?? "IDR",
    };
  } catch {
    return null;
  }
}

export async function getQuotes(tickers: string[]): Promise<Quote[]> {
  const unique = [...new Set(tickers.map((t) => t.toUpperCase()))].slice(0, 6);
  const results = await Promise.all(unique.map(fetchOne));
  return results.filter((q): q is Quote => q !== null);
}
