import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateOrderTotals } from "@/lib/orders";
import { createOrderSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hotelSlug = searchParams.get("hotelSlug");
  const status = searchParams.get("status");
  const limit = Number(searchParams.get("limit") ?? "50");

  if (!hotelSlug) {
    return NextResponse.json({ error: "hotelSlug is required" }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: {
      hotel: { slug: hotelSlug },
      ...(status ? { status } : {}),
    },
    include: {
      table: true,
      items: {
        include: {
          menuItem: true,
        },
      },
      rating: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(
    orders.map((order) => ({
      id: order.id,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      specialNotes: order.specialNotes,
      table: {
        id: order.table.id,
        name: order.table.name,
      },
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        instructions: item.instructions,
        menuItem: {
          id: item.menuItem.id,
          name: item.menuItem.name,
          price: item.menuItem.price,
        },
      })),
      rating: order.rating,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }))
  );
}

export async function POST(request: NextRequest) {
  try {
    const input = createOrderSchema.parse(await request.json());

    const hotel = await prisma.hotel.findUnique({
      where: { slug: input.hotelSlug },
      include: { analytics: true },
    });
    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    const table = await prisma.table.findUnique({
      where: { qrSlug: input.tableSlug },
    });
    if (!table || table.hotelId !== hotel.id) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: input.items.map((item) => item.menuItemId) } },
    });

    const menuMap = new Map(menuItems.map((item) => [item.id, item]));

    const items = input.items.map((item) => {
      const menuItem = menuMap.get(item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItemId} not found`);
      }
      return {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        instructions: item.instructions,
      };
    });

    const totals = calculateOrderTotals(items);

    const created = await prisma.order.create({
      data: {
        hotelId: hotel.id,
        tableId: table.id,
        status: "PENDING",
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        specialNotes: input.specialNotes,
        items: {
          create: items.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
            instructions: item.instructions,
            lineTotal: item.price * item.quantity,
          })),
        },
      },
      include: {
        table: true,
        items: {
          include: { menuItem: true },
        },
      },
    });

    await prisma.hotelAnalytics.upsert({
      where: { hotelId: hotel.id },
      update: {
        totalOrders: { increment: 1 },
        totalRevenue: { increment: created.total },
      },
      create: {
        hotelId: hotel.id,
        totalOrders: 1,
        totalRevenue: created.total,
        avgRating: 0,
        reviewCount: 0,
      },
    });

    return NextResponse.json(
      {
        orderId: created.id,
        status: created.status,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Failed to create order", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to create order" }, { status: 400 });
  }
}
