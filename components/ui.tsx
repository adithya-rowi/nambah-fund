import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl2 bg-white/80 backdrop-blur border border-clay/60 shadow-soft ${className}`}
    >
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  accent = "ink",
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  accent?: "ink" | "gain" | "loss" | "brand";
}) {
  const color =
    accent === "gain"
      ? "text-gain"
      : accent === "loss"
        ? "text-loss"
        : accent === "brand"
          ? "text-brand-dark"
          : "text-ink";
  return (
    <div className="p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${color}`}>{value}</div>
      {sub && <div className="mt-0.5 text-sm text-muted">{sub}</div>}
    </div>
  );
}

export function Pill({ children, tone = "brand" }: { children: ReactNode; tone?: "brand" | "gain" | "loss" | "muted" }) {
  const map = {
    brand: "bg-brand/10 text-brand-dark",
    gain: "bg-gain/10 text-gain",
    loss: "bg-loss/10 text-loss",
    muted: "bg-sand text-muted",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[tone]}`}>
      {children}
    </span>
  );
}
