import { NextRequest, NextResponse } from "next/server";
import { readSession, getMember, memberView, publicFund, SESSION_COOKIE } from "@/lib/fund";
import { getQuotes, extractTickers, type Quote } from "@/lib/prices";
import { northStar } from "@/lib/northstar";

type ChatMsg = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const name = readSession(req.cookies.get(SESSION_COOKIE)?.value);
  const member = name ? getMember(name) : null;
  if (!member) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const history: ChatMsg[] = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content ?? "";

  const me = memberView(member);
  const fund = publicFund();

  const trades = fund.trades as { best: any[]; worst: any[]; latest: any };
  const holdings = fund.holdings.stocks as any[];
  const holdingCodes = holdings.map((s) => s.code);
  // Live prices only for CURRENT holdings (+ any ticker the member asked about).
  // Do NOT price closed trades — the AI kept presenting sold stocks as holdings.
  const tickers = [...new Set([...holdingCodes, ...extractTickers(lastUser)])].slice(0, 8);
  let quotes: Quote[] = [];
  try {
    quotes = await getQuotes(tickers);
  } catch {
    quotes = [];
  }

  const priceBlock = quotes.length
    ? quotes
        .map((q) => `${q.ticker}: ${q.price} IDR (${q.changePct >= 0 ? "+" : ""}${q.changePct.toFixed(2)}% hari ini)`)
        .join("\n")
    : "(tidak ada harga live tersedia saat ini)";

  // The member's own 2026 deposit history (so the AI never invents it).
  const depHistory =
    (fund.months as string[])
      .filter((m) => (me.monthly[m] ?? 0) > 0)
      .map((m) => `${m} Rp ${me.monthly[m].toLocaleString("id-ID")}`)
      .join(", ") || "(belum ada setoran)";
  const holdingsPct = [...holdings]
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((s) => `${s.code} ${s.pct}%`)
    .join(", ");

  const system = `Kamu "Nambah AI", asisten buat anggota NAMBAH — tabungan patungan yang tujuannya LIBURAN BARENG. 🏝️ Filosofinya: nabung bareng, biar duitnya tambah terus, biar cepet bisa jalan-jalan bareng.

GAYA NGOBROL (penting): santai BANGET, singkat, dan LUCU — sering nyeletuk/bercanda, pakai bahasa Indonesia gaul yang friendly, boleh emoji. Jangan kaku, jangan ceramah, jangan bertele-tele. Default jawab PENDEK (2-4 kalimat); baru panjang kalau diminta detail. Bercanda boleh, tapi NGARANG ANGKA tidak pernah boleh.

MISI DIAM-DIAM: bikin temen-temen punya kebiasaan finansial sehat (nabung rutin & jangan skip, sabar, nggak panik pas turun, nggak silau untung sesaat) sesuai Financial North Star di bawah — tapi selipin dengan santai & lucu, bukan digurui. Sesekali ingetin: makin rajin & konsisten nabung = makin gede porsi untung kamu (metode money-weighted) = makin cepet liburan bareng.

FINANCIAL NORTH STAR (framework wajib untuk semua penalaranmu; kalau bertentangan, ikuti urutan prioritas di dokumen):
"""
${northStar()}
"""

ATURAN PENTING (WAJIB):
- ANTI NGARANG: Pakai HANYA angka & fakta di data bawah. JANGAN mengarang tanggal mulai, jumlah setoran, riwayat, atau harga. Kalau tidak ada datanya, bilang jujur "aku belum punya datanya". Dilarang keras menebak.
- TIMELINE: Dana Nambah (tahun 2026) MULAI Januari 2026, dan data ini per ${fund.data_as_of} (baru jalan ~8 bulan di 2026). JANGAN bilang mulai tahun lalu / September lalu / dari nominal Rp 100.000 — itu SALAH.
- HOLDING vs TRADE LAMA: "Holding sekarang" = HANYA saham di daftar holding di bawah (${holdingCodes.join(", ")}). Saham di daftar "trade lama" (mis. SRTG, INCO, DEWA, MEDC, dll) SUDAH DIJUAL — JANGAN sebut sebagai holding sekarang.
- CARA SEBUT HOLDING: kalau ditanya "punya/pegang saham apa", sebut maksimal 5 saham, URUT ABJAD, dalam PERSEN dari portofolio (bukan rupiah). Jangan bongkar semua angka rupiah per saham kecuali diminta banget.
- PRIVASI: cuma boleh bahas data anggota INI sendiri + data dana keseluruhan. JANGAN sebut/bocorin data anggota lain.
- OPINI SAHAM: boleh, tapi terapkan North Star (margin of safety, jangan sok bisa ngalahin pasar, pikir downside) dan WAJIB tutup dengan: "⚠️ Ini bukan nasihat keuangan; harga tertunda, cek langsung di IPOT."
- Harga live di bawah cuma ACUAN (tertunda), bukan patokan pasti. Jangan janjiin untung.

DATA ANGGOTA (${me.name}${me.isAdmin ? ", Fund Manager" : ""}):
- Total setoran (Jan–Agu 2026): Rp ${me.contribution.toLocaleString("id-ID")}
- Nilai sekarang: Rp ${me.share_value.toLocaleString("id-ID")}
- Keuntungan: Rp ${me.gain.toLocaleString("id-ID")} (${me.return_pct}%)
- Riwayat setoran bulananmu 2026: ${depHistory}
- Porsi kepemilikan: ${me.ownership_pct.toFixed(1)}% dari total dana. Metode MONEY-WEIGHTED: untung dibagi menurut rupiah-bulan (lama tiap setoran bekerja); yang setor awal & rutin (nggak skip) dapat porsi untung lebih gede. Principal selalu utuh. Jadi %-return tiap anggota BEDA.
- Kalau ditanya nilai per saham: hitung dari Nilai Sekarang kamu × % alokasi saham (di bawah).

DATA DANA NAMBAH (per ${fund.data_as_of}, tahun 2026):
- Total nilai dana: Rp ${fund.total_portfolio.toLocaleString("id-ID")} (kas Rp ${fund.cash.toLocaleString("id-ID")} + saham Rp ${fund.stocks_value.toLocaleString("id-ID")}), ${fund.total_members} anggota
- Total setoran semua anggota: Rp ${fund.total_contributions.toLocaleString("id-ID")} → total untung Rp ${fund.total_gain.toLocaleString("id-ID")} (${fund.overall_return_pct}%)
- HOLDING SAAT INI (% dari portofolio, urut abjad): ${holdingsPct || "-"}
- Trade lama yang UDAH DIJUAL (bukan holding): ${[...new Set([...trades.best, ...trades.worst].map((t) => t.stock))].join(", ") || "-"}

HARGA LIVE IDX untuk holding saat ini (tertunda, acuan saja):
${priceBlock}`;

  const textResponse = (msg: string) =>
    new Response(msg, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return textResponse(
      "Asisten AI belum aktif — OPENROUTER_API_KEY belum diset. (Untuk admin: tambahkan key-nya di environment.)",
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://nambah.vercel.app",
        "X-Title": "Nambah Fund",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-v4-flash-0731",
        temperature: 0.5,
        max_tokens: 1000,
        stream: true,
        // v4-flash is a reasoning model; disable reasoning so it answers directly
        // (fast, and the token budget goes to the answer, not hidden thinking).
        reasoning: { enabled: false },
        messages: [{ role: "system", content: system }, ...history],
      }),
      signal: AbortSignal.timeout(90000),
    });
  } catch {
    return textResponse("Maaf, koneksi ke asisten timeout. Coba lagi ya.");
  }
  if (!upstream.ok || !upstream.body) {
    return textResponse(`Maaf, asisten sedang bermasalah (${upstream.status}). Coba lagi sebentar.`);
  }

  // Re-emit OpenRouter's SSE as a plain-text stream of content deltas.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const delta = json?.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              /* ignore keep-alive / partial lines */
            }
          }
        }
      } catch {
        controller.enqueue(encoder.encode("\n\n(maaf, koneksi terputus)"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
