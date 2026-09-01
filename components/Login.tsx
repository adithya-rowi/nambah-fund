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
    <div className="relative flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-[400px]">
        {/* Brand */}
        <div className="rise mb-8 flex flex-col items-center text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-[1.15rem] bg-gradient-to-br from-brand to-brand-dark shadow-lift">
            <Sprout />
          </div>
          <h1 className="text-[2rem] font-extrabold leading-none tracking-tight text-ink">Nambah</h1>
          <p className="mt-2 text-sm text-muted">Nabung bareng buat liburan bareng — biar tambah terus 🏝️</p>
        </div>

        {/* Card */}
        <div className="rise-2 rounded-[1.4rem] border border-clay bg-surface p-6 shadow-soft sm:p-7">
          <div className="mb-5">
            <h2 className="text-base font-bold text-ink">Masuk ke akunmu</h2>
            <p className="mt-0.5 text-[13px] text-muted">Datamu privat — cuma kamu yang lihat.</p>
          </div>

          <a
            href="/api/auth/google/start"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-clay bg-surface px-4 py-3 text-sm font-medium text-ink transition hover:bg-sand active:scale-[.99]"
          >
            <GoogleIcon />
            Masuk dengan Google
          </a>

          {error && (
            <p className="mt-4 rounded-lg bg-loss/8 px-3 py-2 text-sm text-loss" role="alert">
              {error}
            </p>
          )}

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-clay" />
            <span className="text-xs font-medium text-muted">atau pakai PIN</span>
            <span className="h-px flex-1 bg-clay" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-muted">
                Nama panggilan
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="mis. Indah"
                autoComplete="off"
                className="w-full rounded-xl border border-clay bg-surface px-4 py-3 text-ink outline-none transition placeholder:text-muted/50 focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </div>

            <div>
              <label htmlFor="pin" className="mb-1.5 block text-xs font-semibold text-muted">
                PIN 6 digit
              </label>
              <input
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="off"
                placeholder="••••••"
                className="w-full rounded-xl border border-clay bg-surface px-4 py-3 text-lg tracking-[0.5em] text-ink outline-none transition placeholder:tracking-[0.3em] placeholder:text-muted/40 focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name || pin.length < 4}
              className="w-full rounded-xl bg-brand px-4 py-3.5 font-semibold text-white shadow-soft transition hover:bg-brand-dark active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Masuk…" : "Masuk"}
            </button>
          </form>
        </div>

        <p className="rise-3 mt-6 text-center text-xs text-muted">
          Belum punya akses? Hubungi <span className="font-medium text-ink">Adith</span> (fund manager).
        </p>
      </div>
    </div>
  );
}

function Sprout() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21V11"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 12C12 8.5 9 6.5 5.5 6.5C5.5 10 8 12 12 12Z"
        fill="white"
        fillOpacity="0.9"
      />
      <path
        d="M12 11C12 7 15 4.5 18.5 4.5C18.5 8.5 15.5 11 12 11Z"
        fill="white"
      />
    </svg>
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
