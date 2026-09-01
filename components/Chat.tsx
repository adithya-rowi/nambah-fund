"use client";
import { useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Berapa untung aku tahun ini?",
  "Uangku sekarang diinvestasikan di mana?",
  "Gimana pendapatmu soal BUMI sekarang?",
  "Jelasin NAV itu apa dong",
];

export default function Chat({ memberName }: { memberName: string }) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `Hai ${memberName}! Aku asisten AI Nambah. Tanya apa aja soal investasimu, kinerja dana, atau pasar saham. 😊`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(1) }), // drop the canned greeting
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "Maaf, coba lagi ya." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Koneksi bermasalah. Coba lagi ya." }]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }));
    }
  }

  return (
    <div className="flex h-[520px] flex-col">
      <div className="flex items-center gap-2 border-b border-clay/60 px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/15 text-brand-dark">✨</span>
        <div>
          <div className="text-sm font-bold text-ink">Tanya AI Nambah</div>
          <div className="text-xs text-muted">Privat • cuma soal danamu</div>
        </div>
      </div>

      <div ref={scrollRef} className="nice-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-brand text-white rounded-br-sm"
                  : "bg-sand text-ink rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-sand px-3.5 py-2.5 text-sm text-muted">
              <span className="inline-flex gap-1">
                <Dot /> <Dot d={0.15} /> <Dot d={0.3} />
              </span>
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-clay bg-white/70 px-3 py-1.5 text-xs text-ink hover:border-brand hover:text-brand-dark"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-clay/60 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pertanyaanmu…"
          className="flex-1 rounded-full border border-clay bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="grid h-10 w-10 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-dark disabled:opacity-40"
          aria-label="Kirim"
        >
          ➤
        </button>
      </form>
    </div>
  );
}

function Dot({ d = 0 }: { d?: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
      style={{ animationDelay: `${d}s` }}
    />
  );
}
