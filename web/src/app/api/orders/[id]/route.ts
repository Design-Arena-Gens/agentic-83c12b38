import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { updateOrderStatusSchema } from "@/lib/validators";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  const { status } = updateOrderStatusSchema.parse(body);

  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { hotelId: true, status: true, total: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.hotelId !== session.hotelId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status,
    },
  });

  if (status === "COMPLETED" && order.status !== "COMPLETED") {
    await prisma.hotelAnalytics.updateMany({
      where: { hotelId: session.hotelId },
      data: {
        totalRevenue: { increment: order.total },
      },
    });
  }

  return NextResponse.json({ success: true, order: updated });
}
