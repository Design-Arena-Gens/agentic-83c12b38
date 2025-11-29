import { NextRequest, NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/auth";

export async function POST(_: NextRequest) {
  await clearAdminSessionCookie();
  return NextResponse.json({ success: true });
}
