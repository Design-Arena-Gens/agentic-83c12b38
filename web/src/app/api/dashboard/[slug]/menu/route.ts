import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { manageMenuItemSchema } from "@/lib/validators";

async function ensureHotelAccess(slug: string) {
  const session = await getAdminSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!hotel || hotel.id !== session.hotelId) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { hotelId: hotel.id };
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const access = await ensureHotelAccess(slug);
  if ("error" in access) return access.error;

  const input = manageMenuItemSchema.parse(await request.json());

  const item = await prisma.menuItem.create({
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      isAvailable: input.isAvailable ?? true,
      imageUrl: input.imageUrl || null,
      hotelId: access.hotelId,
      categoryId: input.categoryId,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const access = await ensureHotelAccess(slug);
  if ("error" in access) return access.error;

  const schema = manageMenuItemSchema.extend({
    id: z.string().min(1),
  });
  const input = schema.parse(await request.json());

  const item = await prisma.menuItem.update({
    where: {
      id: input.id,
      hotelId: access.hotelId,
    },
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      isAvailable: input.isAvailable ?? true,
      imageUrl: input.imageUrl || null,
      categoryId: input.categoryId,
    },
  });

  return NextResponse.json({ item });
}
