// Regenerates strong random 6-digit PINs for every member, stores only their
// salted hashes in data/fundData.json, and writes the plaintext PINs to
// secrets/pins.txt (gitignored) for you to hand out privately.
//
//   npm run setup-pins
//
// Re-running generates NEW PINs for everyone. Ensures PIN_SALT + SESSION_SECRET
// exist in .env.local (and reuses the existing PIN_SALT if already set there).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { randomInt, randomBytes, createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = join(root, "data", "fundData.json");
const envPath = join(root, ".env.local");
const secretsDir = join(root, "secrets");

function readEnvLocal() {
  const env = {};
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2];
    }
  }
  return env;
}

function writeEnvLocal(env) {
  const keys = ["OPENROUTER_API_KEY", "OPENROUTER_MODEL", "SESSION_SECRET", "PIN_SALT"];
  const body = keys.map((k) => `${k}=${env[k] ?? ""}`).join("\n") + "\n";
  writeFileSync(envPath, body);
}

const hashPin = (salt, pin) =>
  createHash("sha256").update(`${salt}:${pin}`).digest("hex");

const env = readEnvLocal();
const salt = env.PIN_SALT || randomBytes(16).toString("hex");
env.PIN_SALT = salt;
if (!env.SESSION_SECRET) env.SESSION_SECRET = randomBytes(32).toString("hex");
if (!env.OPENROUTER_MODEL) env.OPENROUTER_MODEL = "deepseek/deepseek-chat";

const data = JSON.parse(readFileSync(dataPath, "utf8"));
const lines = [];
for (const member of data.members) {
  const pin = String(randomInt(100000, 1000000)); // 6 digits, no leading zero
  delete member.pin;
  member.pin_hash = hashPin(salt, pin);
  lines.push(`${member.name.padEnd(12)} ${pin}`);
}

writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n");
writeEnvLocal(env);

if (!existsSync(secretsDir)) mkdirSync(secretsDir);
const secretsFile = join(secretsDir, "pins.txt");
writeFileSync(
  secretsFile,
  `Nambah member PINs — generated ${new Date().toISOString()}\n` +
    `Hand each person THEIR pin privately (e.g. WhatsApp). Do not commit this file.\n\n` +
    lines.join("\n") +
    "\n",
);

console.log("Generated new PINs (hashed into data/fundData.json).");
console.log("Plaintext PINs written to secrets/pins.txt (gitignored):\n");
console.log(lines.join("\n"));
console.log(`\nPIN_SALT and SESSION_SECRET written to .env.local.`);
console.log("Set the SAME PIN_SALT and SESSION_SECRET in Vercel before deploying.");
