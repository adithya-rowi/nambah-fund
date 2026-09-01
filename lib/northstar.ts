// Server-only: loads the Financial North Star so the AI always reasons from it.
// Single source of truth — edit Principles/financial-north-star.md and the
// assistant follows it. Cached per server process; falls back gracefully.
import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

let cached: string | null = null;

export function northStar(): string {
  if (cached !== null) return cached;
  try {
    cached = readFileSync(
      join(process.cwd(), "Principles", "financial-north-star.md"),
      "utf8",
    );
  } catch {
    cached = "";
  }
  return cached;
}
