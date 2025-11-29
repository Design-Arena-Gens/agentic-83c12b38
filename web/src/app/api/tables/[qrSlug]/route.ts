import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, context: { params: Promise<{ qrSlug: string }> }) {
  const { qrSlug } = await context.params;
  const table = await prisma.table.findUnique({
    where: { qrSlug },
    include: {
      hotel: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          googleReviewUrl: true,
        },
      },
    },
  });

  if (!table) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: table.id,
    name: table.name,
    qrSlug: table.qrSlug,
    hotel: table.hotel,
  });
}
