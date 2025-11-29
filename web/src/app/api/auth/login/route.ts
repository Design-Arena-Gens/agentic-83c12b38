import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAdminSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { slug, pin } = (await request.json()) as { slug?: string; pin?: string };

  if (!slug || !pin) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    select: { id: true, adminPin: true },
  });

  if (!hotel || hotel.adminPin !== pin) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await setAdminSessionCookie(hotel.id);
  return NextResponse.json({ success: true });
}
