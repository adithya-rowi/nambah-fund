"use client";
import { useEffect, useState } from "react";
import { Card, Stat, Pill } from "./ui";
import { idr, idrCompact, pct, units as fmtUnits } from "@/lib/format";
import type { AdminMember, PublicFund } from "./types";

export default function AdminPanel({ onBack, onLogout }: { onBack: () => void; onLogout: () => void }) {
  const [members, setMembers] = useState<AdminMember[] | null>(null);
  const [fund, setFund] = useState<PublicFund | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin")
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => {
        setMembers(d.members);
        setFund(d.fund);
      })
      .catch(() => setError("Tidak bisa memuat data admin."));
  }, []);

  const totalUnits = members?.reduce((s, m) => s + m.units, 0) ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-2xl text-white shadow-soft">🛠️</span>
          <div>
            <div className="text-lg font-extrabold leading-tight text-ink">Panel Admin</div>
            <div className="text-xs text-muted">Hanya kamu (fund manager) yang lihat ini</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="rounded-full border border-brand bg-white px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-brand/10">
            Dashboard-ku
          </button>
          <button onClick={onLogout} className="rounded-full border border-clay bg-white px-4 py-2 text-sm text-muted hover:text-ink">
            Keluar
          </button>
        </div>
      </div>

      {error && <Card className="p-6 text-loss">{error}</Card>}

      {fund && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card><Stat label="Total dana" value={idrCompact(fund.total_portfolio)} accent="brand" /></Card>
          <Card><Stat label="Total setoran" value={idrCompact(fund.total_contributions)} /></Card>
          <Card><Stat label="Total untung" value={idrCompact(fund.total_gain)} accent="gain" sub={pct(fund.overall_return_pct)} /></Card>
          <Card><Stat label="Anggota" value={String(fund.total_members)} /></Card>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="border-b border-clay/60 px-5 py-3 font-bold text-ink">Semua anggota — urut nilai investasi</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3">#</th>
                <th className="px-3 py-3">Nama</th>
                <th className="px-3 py-3 text-right">Setoran</th>
                <th className="px-3 py-3 text-right">Nilai kini</th>
                <th className="px-3 py-3 text-right">Untung</th>
                <th className="px-3 py-3 text-right">Return</th>
                <th className="px-3 py-3 text-right">Unit</th>
                <th className="px-5 py-3 text-right">% dana</th>
              </tr>
            </thead>
            <tbody>
              {members?.map((m, i) => (
                <tr key={m.name} className="border-t border-clay/40 hover:bg-sand/40">
                  <td className="px-5 py-3 text-muted">{i + 1}</td>
                  <td className="px-3 py-3">
                    <div className="font-semibold text-ink">{m.name}</div>
                    <div className="text-[11px] text-muted">{m.role}</div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{idr(m.contribution)}</td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums text-ink">{idr(m.share_value)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-gain">+{idrCompact(m.gain)}</td>
                  <td className="px-3 py-3 text-right">
                    <Pill tone="gain">{pct(m.return_pct)}</Pill>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted">{fmtUnits(m.units)}</td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {totalUnits ? ((m.units / totalUnits) * 100).toFixed(1) : "0.0"}%
                  </td>
                </tr>
              ))}
              {!members && !error && (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-muted">Memuat…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
