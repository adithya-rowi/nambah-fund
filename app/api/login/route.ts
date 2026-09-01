import { NextRequest, NextResponse } from "next/server";
import { verifyLogin, createSession, memberView, SESSION_COOKIE } from "@/lib/fund";

export async function POST(req: NextRequest) {
  const { name, pin } = await req.json().catch(() => ({}));
  if (typeof name !== "string" || typeof pin !== "string") {
    return NextResponse.json({ error: "Nama dan PIN wajib diisi." }, { status: 400 });
  }
  const member = verifyLogin(name, pin);
  if (!member) {
    return NextResponse.json({ error: "Nama atau PIN salah." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, member: memberView(member) });
  res.cookies.set(SESSION_COOKIE, createSession(member.name), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
