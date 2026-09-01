import { NextRequest, NextResponse } from "next/server";
import {
  readSession,
  getMember,
  memberView,
  publicFund,
  SESSION_COOKIE,
} from "@/lib/fund";

export async function GET(req: NextRequest) {
  const name = readSession(req.cookies.get(SESSION_COOKIE)?.value);
  const member = name ? getMember(name) : null;
  if (!member) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  // Only the caller's private data + shared fund data ever leave the server.
  return NextResponse.json({ member: memberView(member), fund: publicFund() });
}
