import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;

  const hotel = await prisma.hotel.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!hotel || hotel.id !== session.hotelId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [analytics, outstandingOrders, trendingItems] = await Promise.all([
    prisma.hotelAnalytics.findUnique({ where: { hotelId: hotel.id } }),
    prisma.order.count({
      where: { hotelId: hotel.id, NOT: { status: "COMPLETED" } },
    }),
    prisma.orderItem.groupBy({
      by: ["menuItemId"],
      where: { order: { hotelId: hotel.id } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: trendingItems.map((item) => item.menuItemId) } },
  });
  const menuMap = new Map(menuItems.map((item) => [item.id, item]));

  return NextResponse.json({
    analytics,
    outstandingOrders,
    trendingItems: trendingItems.map((item) => ({
      menuItemId: item.menuItemId,
      totalQuantity: item._sum.quantity ?? 0,
      menuItem: menuMap.get(item.menuItemId),
    })),
  });
}
