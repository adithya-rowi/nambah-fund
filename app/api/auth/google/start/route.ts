import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

// Kicks off Google OAuth: sets a state cookie and redirects to Google's consent.
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/?error=google_not_configured", req.nextUrl.origin));
  }
  const state = randomBytes(16).toString("hex");
  const redirectUri = new URL("/api/auth/google/callback", req.nextUrl.origin).toString();

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(url.toString());
  res.cookies.set("g_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
