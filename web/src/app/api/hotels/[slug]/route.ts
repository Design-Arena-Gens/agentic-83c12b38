import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    include: {
      menuCategories: {
        orderBy: { name: "asc" },
        include: {
          items: {
            where: { isAvailable: true },
            orderBy: { name: "asc" },
          },
        },
      },
      tables: {
        orderBy: { name: "asc" },
      },
      analytics: true,
    },
  });

  if (!hotel) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: hotel.id,
    name: hotel.name,
    slug: hotel.slug,
    logoUrl: hotel.logoUrl,
    googleReviewUrl: hotel.googleReviewUrl,
    description: hotel.description,
    menuCategories: hotel.menuCategories.map((category) => ({
      id: category.id,
      name: category.name,
      items: category.items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        categoryId: category.id,
      })),
    })),
    tables: hotel.tables.map((table) => ({
      id: table.id,
      name: table.name,
      qrSlug: table.qrSlug,
    })),
    analytics: hotel.analytics,
  });
}
