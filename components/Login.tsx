"use client";
import { useState } from "react";

export default function Login({ onSuccess }: { onSuccess: (member: any) => void }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal masuk.");
        return;
      }
      onSuccess(data.member);
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="rise w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-brand text-3xl text-white shadow-soft">
            🌱
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Nambah</h1>
          <p className="mt-1 text-sm text-muted">Dana patungan kita. Privat & transparan.</p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-xl2 border border-clay/60 bg-white/80 p-6 shadow-soft backdrop-blur"
        >
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
            Nama panggilan
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="mis. Indah"
            autoComplete="off"
            className="mb-4 w-full rounded-xl border border-clay bg-white px-4 py-3 outline-none focus:border-brand"
          />

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
            PIN (6 digit)
          </label>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            placeholder="••••••"
            className="w-full rounded-xl border border-clay bg-white px-4 py-3 tracking-[0.4em] outline-none focus:border-brand"
          />

          {error && <p className="mt-3 text-sm text-loss">{error}</p>}

          <button
            type="submit"
            disabled={loading || !name || pin.length < 4}
            className="mt-5 w-full rounded-xl bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-40"
          >
            {loading ? "Masuk…" : "Masuk"}
          </button>
          <p className="mt-4 text-center text-xs text-muted">
            Belum punya PIN? Hubungi Adith (fund manager).
          </p>
        </form>
      </div>
    </div>
  );
}
