// Pure formatting helpers, safe on client and server. Indonesian conventions.
export function idr(n: number): string {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export function idrCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `Rp ${(n / 1e9).toFixed(1)} M`; // miliar
  if (abs >= 1e6) return `Rp ${(n / 1e6).toFixed(1)} jt`; // juta
  if (abs >= 1e3) return `Rp ${(n / 1e3).toFixed(0)} rb`; // ribu
  return idr(n);
}

export function pct(n: number, withSign = true): string {
  const s = n > 0 && withSign ? "+" : "";
  return `${s}${n.toFixed(1)}%`;
}

export function units(n: number): string {
  return n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
