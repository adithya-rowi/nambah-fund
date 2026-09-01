import { NextRequest, NextResponse } from "next/server";
import { getMemberByEmail, createSession, SESSION_COOKIE } from "@/lib/fund";

// Handles Google's redirect: verifies state, exchanges the code, maps the
// Google email to a member, and mints our normal session cookie.
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const back = (err: string) => NextResponse.redirect(new URL(`/?error=${err}`, origin));

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("g_state")?.value;
  if (!code || !state || !savedState || state !== savedState) return back("google_state");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return back("google_not_configured");

  const redirectUri = new URL("/api/auth/google/callback", origin).toString();

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!tokenRes.ok) return back("google_token");
    const tokens: any = await tokenRes.json();

    const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!infoRes.ok) return back("google_userinfo");
    const info: any = await infoRes.json();

    if (!info.email || info.email_verified === false) return back("google_email");

    const member = getMemberByEmail(info.email);
    if (!member) return back("not_member");

    const res = NextResponse.redirect(new URL("/", origin));
    res.cookies.set(SESSION_COOKIE, createSession(member.name), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    res.cookies.set("g_state", "", { path: "/", maxAge: 0 });
    return res;
  } catch {
    return back("google_failed");
  }
}
