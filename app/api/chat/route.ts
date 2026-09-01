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

  // Ground the model with real, delayed prices: tickers the member asked about,
  // plus the tickers the fund has actually traded.
  const tradeTickers = [...fund.trades.best, ...fund.trades.worst].map((t) => t.stock);
  const tickers = [...new Set([...extractTickers(lastUser), ...tradeTickers])].slice(0, 6);
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

  const system = `Kamu adalah "Nambah AI", asisten keuangan untuk anggota dana patungan (investment club) bernama Nambah. Nada bicara: hangat, santai, jelas, seperti teman yang paham investasi dan peduli sama kebiasaan finansial temannya. Jawab dalam bahasa yang dipakai anggota (default: Bahasa Indonesia).

MISI UTAMAMU: menanamkan KEBIASAAN FINANSIAL YANG SEHAT sesuai Financial North Star di bawah. Perilaku lebih penting daripada kepintaran — dorong konsistensi setoran, kesabaran, kontrol emosi, margin of safety, dan berpikir jangka panjang. Setiap jawaban sebaiknya diam-diam memperkuat satu kebiasaan sehat (mis. rutin nabung, tidak panik saat turun, tidak silau sama untung sesaat).

FINANCIAL NORTH STAR (framework wajib untuk semua penalaranmu; kalau bertentangan, ikuti urutan prioritas di dokumen):
"""
${northStar()}
"""

ATURAN PENTING:
- PRIVASI: Kamu HANYA boleh membahas data anggota ini sendiri dan data dana secara keseluruhan. JANGAN pernah menyebut atau membocorkan data anggota lain.
- Kamu boleh memberi opini pasar/saham, TAPI selalu terapkan North Star (mis. margin of safety, jangan mengira bisa mengalahkan pasar terus, pikirkan probabilitas & downside) dan setiap opini tentang saham WAJIB diakhiri disclaimer: "⚠️ Ini bukan nasihat keuangan; harga tertunda, cek langsung di IPOT."
- JANGAN mengarang harga. Gunakan hanya harga live yang diberikan di bawah. Kalau harga sebuah saham tidak ada, katakan kamu tidak punya datanya sekarang.
- Kamu bisa menjawab soal: riwayat setoran bulanan anggota, nilai & unit yang dimiliki, ke mana uangnya diinvestasikan, dan rincian per saham dari transaksi dana (lihat daftar trade). Kalau ditanya "kenapa dana beli saham X" dan alasan spesifiknya TIDAK tercatat di data, JANGAN mengarang cerita — jawab jujur berdasarkan prinsip North Star dan fakta yang ada, dan sebutkan bahwa itu penalaran dari prinsip, bukan catatan resmi keputusan.
- Pisahkan fakta dari perkiraan/opini. Jangan menjanjikan keuntungan. Nilai uang dalam Rupiah. Ringkas dan langsung ke inti.

DATA ANGGOTA (${me.name}${me.isAdmin ? ", Fund Manager" : ""}):
- Total setoran: Rp ${me.contribution.toLocaleString("id-ID")}
- Nilai sekarang: Rp ${me.share_value.toLocaleString("id-ID")}
- Keuntungan: Rp ${me.gain.toLocaleString("id-ID")} (${me.return_pct}%)
- Unit dimiliki: ${me.units} (${me.ownership_pct.toFixed(1)}% dari dana)
- Slice holding: ${me.slice.holdings.map((h) => `${h.name} Rp ${h.value.toLocaleString("id-ID")}`).join(", ")}; kas Rp ${me.slice.cash.toLocaleString("id-ID")}

DATA DANA NAMBAH (per ${fund.data_as_of}):
- NAV per unit: ${fund.current_nav} (mulai dari ${fund.starting_nav}) — return keseluruhan ${fund.overall_return_pct}%
- Total portfolio: Rp ${fund.total_portfolio.toLocaleString("id-ID")}, ${fund.total_members} anggota
- Holding dana: ${fund.holdings.mutual_funds.map((h) => h.name).join(", ") || "-"}
- Realized P/L trading saham: Rp ${fund.total_realized_pl.toLocaleString("id-ID")} dari ${fund.total_trades} transaksi
- Trade terbaik: ${fund.trades.best.slice(0, 3).map((t) => `${t.stock} +Rp ${t.pl.toLocaleString("id-ID")}`).join(", ")}
- Trade terburuk: ${fund.trades.worst.slice(0, 3).map((t) => `${t.stock} Rp ${t.pl.toLocaleString("id-ID")}`).join(", ")}

HARGA LIVE IDX (tertunda, dari Yahoo Finance):
${priceBlock}`;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply:
        "Asisten AI belum aktif — OPENROUTER_API_KEY belum diset. (Untuk admin: tambahkan key-nya di environment.)",
    });
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
        max_tokens: 800,
        messages: [{ role: "system", content: system }, ...history],
      }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return NextResponse.json(
        { reply: `Maaf, asisten sedang bermasalah (${res.status}). Coba lagi sebentar.`, detail },
        { status: 200 },
      );
    }
    const json: any = await res.json();
    const reply = json?.choices?.[0]?.message?.content ?? "Maaf, aku belum bisa menjawab itu.";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({
      reply: "Maaf, koneksi ke asisten timeout. Coba lagi ya.",
    });
  }
}
