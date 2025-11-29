import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { manageTableSchema } from "@/lib/validators";
import { slugify } from "@/lib/slugify";

const updateSchema = manageTableSchema.extend({
  id: z.string().min(1),
});

async function ensureHotelAccess(slug: string) {
  const session = await getAdminSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    select: { id: true, slug: true },
  });

  if (!hotel || hotel.id !== session.hotelId) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { hotel };
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const access = await ensureHotelAccess(slug);
  if ("error" in access) return access.error;

  const tables = await prisma.table.findMany({
    where: { hotelId: access.hotel.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ tables });
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const access = await ensureHotelAccess(slug);
  if ("error" in access) return access.error;

  const input = manageTableSchema.parse(await request.json());
  const qrSlug = slugify(`${access.hotel.slug}-${input.name}`);

  const table = await prisma.table.create({
    data: {
      name: input.name,
      qrSlug,
      hotelId: access.hotel.id,
    },
  });

  return NextResponse.json({ table }, { status: 201 });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const access = await ensureHotelAccess(slug);
  if ("error" in access) return access.error;

  const input = updateSchema.parse(await request.json());
  const qrSlug = slugify(`${access.hotel.slug}-${input.name}`);

  const table = await prisma.table.update({
    where: {
      id: input.id,
      hotelId: access.hotel.id,
    },
    data: {
      name: input.name,
      qrSlug,
    },
  });

  return NextResponse.json({ table });
}
