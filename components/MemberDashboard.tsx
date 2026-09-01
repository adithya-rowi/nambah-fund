"use client";
import { Card, Stat, Pill } from "./ui";
import NavChart from "./NavChart";
import Chat from "./Chat";
import { idr, idrCompact, pct, units as fmtUnits } from "@/lib/format";
import type { MemberView, PublicFund, Trade } from "./types";

export default function MemberDashboard({
  member,
  fund,
  onLogout,
  onAdmin,
}: {
  member: MemberView;
  fund: PublicFund;
  onLogout: () => void;
  onAdmin?: () => void;
}) {
  const gainPositive = member.gain >= 0;
  const monthlyMax = Math.max(1, ...Object.values(member.monthly));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Header name={member.name} role={member.role} onLogout={onLogout} onAdmin={onAdmin} />

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        {/* LEFT */}
        <div className="space-y-5">
          {/* Hero */}
          <Card className="rise overflow-hidden">
            <div className="bg-gradient-to-br from-brand to-brand-dark px-6 py-7 text-white">
              <div className="text-sm/relaxed opacity-90">Nilai investasimu sekarang</div>
              <div className="mt-1 text-4xl font-extrabold tabular-nums">{idr(member.share_value)}</div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-white/20 px-3 py-1 font-semibold">
                  {gainPositive ? "▲" : "▼"} {idr(Math.abs(member.gain))} ({pct(member.return_pct)})
                </span>
                <span className="opacity-90">dari setoran {idr(member.contribution)}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-clay/60">
              <Stat label="Unit" value={fmtUnits(member.units)} />
              <Stat label="Kepemilikan" value={`${member.ownership_pct.toFixed(1)}%`} sub="dari dana" />
              <Stat label="NAV / unit" value={fund.current_nav.toFixed(2)} accent="brand" sub={pct(fund.overall_return_pct)} />
            </div>
          </Card>

          {/* NAV chart */}
          <Card className="p-5">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-bold text-ink">Pertumbuhan NAV Dana</h2>
              <Pill tone="gain">{pct(fund.overall_return_pct)} sejak {fund.start_date.slice(0, 7)}</Pill>
            </div>
            <p className="mb-3 text-xs text-muted">
              NAV per unit naik dari {fund.starting_nav} ke {fund.current_nav.toFixed(2)}. Nilaimu ikut naik proporsional.
            </p>
            <NavChart data={fund.nav_history} />
          </Card>

          {/* Where your money is */}
          <Card className="p-5">
            <h2 className="mb-1 font-bold text-ink">Uangmu ada di mana? 💰</h2>
            <p className="mb-4 text-xs text-muted">
              Bagianmu ({member.ownership_pct.toFixed(1)}%) dari aset dana saat ini.
            </p>
            <div className="space-y-2">
              {member.slice.holdings.map((h) => (
                <Row key={h.name} label={h.name} tag={h.type} value={idr(h.value)} />
              ))}
              <Row label="Kas / tunai" tag="Cash" value={idr(member.slice.cash)} muted />
            </div>
          </Card>

          {/* Your contributions */}
          <Card className="p-5">
            <h2 className="mb-3 font-bold text-ink">Setoran bulananmu — {fund.data_as_of.slice(0, 4)}</h2>
            <div className="flex items-end gap-1.5">
              {fund.months.map((m) => {
                const v = member.monthly[m] ?? 0;
                return (
                  <div key={m} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-24 w-full items-end">
                      <div
                        className="w-full rounded-t-md bg-brand/70"
                        style={{ height: `${(v / monthlyMax) * 100}%` }}
                        title={`${m}: ${idr(v)}`}
                      />
                    </div>
                    <span className="text-[10px] text-muted">{m}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Fund trading story */}
          <div className="grid gap-5 sm:grid-cols-2">
            <TradeCard title="Trade terbaik dana 🚀" trades={fund.trades.best} tone="gain" />
            <TradeCard title="Trade tersulit 📉" trades={fund.trades.worst} tone="loss" />
          </div>
          <p className="px-1 text-center text-xs text-muted">
            Data per {fund.data_as_of} • {fund.broker} • dikelola {fund.fund_manager}
          </p>
        </div>

        {/* RIGHT — AI */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card className="rise overflow-hidden">
            <Chat memberName={member.name} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Header({
  name,
  role,
  onLogout,
  onAdmin,
}: {
  name: string;
  role: string;
  onLogout: () => void;
  onAdmin?: () => void;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-2xl text-white shadow-soft">
          🌱
        </span>
        <div>
          <div className="text-lg font-extrabold leading-tight text-ink">Halo, {name} 👋</div>
          <div className="text-xs text-muted">{role}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onAdmin && (
          <button
            onClick={onAdmin}
            className="rounded-full border border-brand bg-white px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-brand/10"
          >
            Panel Admin
          </button>
        )}
        <button
          onClick={onLogout}
          className="rounded-full border border-clay bg-white px-4 py-2 text-sm text-muted hover:text-ink"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  tag,
  value,
  muted,
}: {
  label: string;
  tag: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-sand/60 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${muted ? "text-muted" : "text-ink"}`}>{label}</span>
        <Pill tone="muted">{tag}</Pill>
      </div>
      <span className="font-bold tabular-nums text-ink">{value}</span>
    </div>
  );
}

function TradeCard({ title, trades, tone }: { title: string; trades: Trade[]; tone: "gain" | "loss" }) {
  return (
    <Card className="p-5">
      <h3 className="mb-3 font-bold text-ink">{title}</h3>
      <div className="space-y-2.5">
        {trades.slice(0, 4).map((t, i) => (
          <div key={i} className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-ink">{t.stock}</div>
              <div className="text-[11px] text-muted">{t.description || t.date}</div>
            </div>
            <span className={`shrink-0 text-sm font-bold tabular-nums ${tone === "gain" ? "text-gain" : "text-loss"}`}>
              {t.pl >= 0 ? "+" : ""}
              {idrCompact(t.pl)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
