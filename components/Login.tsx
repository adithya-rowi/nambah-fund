"use client";
import { useEffect, useState } from "react";

const GOOGLE_ERRORS: Record<string, string> = {
  not_member: "Email Google ini belum terdaftar sebagai anggota. Hubungi Adith.",
  google_not_configured: "Login Google belum diaktifkan.",
  google_email: "Email Google belum terverifikasi.",
  google_state: "Sesi login kadaluarsa, coba lagi.",
  google_token: "Gagal login Google, coba lagi.",
  google_userinfo: "Gagal ambil data Google, coba lagi.",
  google_failed: "Login Google bermasalah, coba lagi.",
};

export default function Login({ onSuccess }: { onSuccess: (member: any) => void }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get("error");
    if (err) {
      setError(GOOGLE_ERRORS[err] || "Login bermasalah, coba lagi.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

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

        <div className="rounded-xl2 border border-clay/60 bg-white/80 p-6 shadow-soft backdrop-blur">
          <a
            href="/api/auth/google/start"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-clay bg-white py-3 font-semibold text-ink transition hover:border-brand"
          >
            <GoogleIcon />
            Masuk dengan Google
          </a>

          {error && <p className="mt-3 text-sm text-loss">{error}</p>}

          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-clay" /> atau pakai PIN <span className="h-px flex-1 bg-clay" />
          </div>

          <form onSubmit={submit}>
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

          <button
            type="submit"
            disabled={loading || !name || pin.length < 4}
            className="mt-5 w-full rounded-xl bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-40"
          >
            {loading ? "Masuk…" : "Masuk"}
          </button>
          <p className="mt-4 text-center text-xs text-muted">
            Belum punya akses? Hubungi Adith (fund manager).
          </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
