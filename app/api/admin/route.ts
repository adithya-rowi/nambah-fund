import { NextRequest, NextResponse } from "next/server";
import {
  readSession,
  getMember,
  allMembersForAdmin,
  publicFund,
  SESSION_COOKIE,
} from "@/lib/fund";

export async function GET(req: NextRequest) {
  const name = readSession(req.cookies.get(SESSION_COOKIE)?.value);
  const member = name ? getMember(name) : null;
  if (!member) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (member.role !== "Fund Manager") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({ members: allMembersForAdmin(), fund: publicFund() });
}
