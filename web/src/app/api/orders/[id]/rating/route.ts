import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ratingSchema } from "@/lib/validators";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { score, comment } = ratingSchema.parse(await request.json());
  const { id } = await context.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { rating: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.rating) {
    return NextResponse.json({ error: "Rating already submitted" }, { status: 400 });
  }

  const rating = await prisma.rating.create({
    data: {
      orderId: order.id,
      hotelId: order.hotelId,
      score,
      comment,
    },
  });

  const stats = await prisma.rating.aggregate({
    where: { hotelId: order.hotelId },
    _avg: { score: true },
    _count: { score: true },
  });

  await prisma.hotelAnalytics.upsert({
    where: { hotelId: order.hotelId },
    update: {
      avgRating: stats._avg.score ?? 0,
      reviewCount: stats._count.score,
    },
    create: {
      hotelId: order.hotelId,
      totalOrders: 0,
      totalRevenue: 0,
      avgRating: stats._avg.score ?? score,
      reviewCount: stats._count.score,
    },
  });

  return NextResponse.json({ rating });
}
