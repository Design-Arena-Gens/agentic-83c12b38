import { prisma } from "@/lib/prisma";
import { OrdersBoard } from "@/components/dashboard/OrdersBoard";
import { MetricsSummary } from "@/components/dashboard/MetricsSummary";
import { TrendingItems } from "@/components/dashboard/TrendingItems";

type PageProps = {
  params: { hotelSlug: string };
  searchParams: { view?: string };
};

export default async function DashboardHomePage({ params, searchParams }: PageProps) {
  const hotel = await prisma.hotel.findUnique({
    where: { slug: params.hotelSlug },
    include: {
      analytics: true,
      orders: {
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
        take: 30,
      },
    },
  });

  if (!hotel) {
    return null;
  }

  const outstandingOrders = await prisma.order.count({
    where: { hotelId: hotel.id, NOT: { status: "COMPLETED" } },
  });

  const trendingGroup = await prisma.orderItem.groupBy({
    by: ["menuItemId"],
    where: { order: { hotelId: hotel.id } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  const relatedMenu = await prisma.menuItem.findMany({
    where: { id: { in: trendingGroup.map((item) => item.menuItemId) } },
  });

  const trendingItems = trendingGroup.map((group) => {
    const menuItem = relatedMenu.find((item) => item.id === group.menuItemId);
    return {
      id: group.menuItemId,
      totalQuantity: group._sum.quantity ?? 0,
      menuItem,
    };
  });

  const totalMenuItems = await prisma.menuItem.count({ where: { hotelId: hotel.id } });

  const view = searchParams.view ?? "orders";
  const initialOrders = hotel.orders.map((order) => ({
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
    rating: order.rating
      ? {
          score: order.rating.score,
          comment: order.rating.comment,
        }
      : null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <MetricsSummary
        analytics={hotel.analytics}
        outstandingOrders={outstandingOrders}
        totalMenuItems={totalMenuItems}
      />
      {view === "analytics" ? (
        <TrendingItems items={trendingItems} />
      ) : (
        <OrdersBoard hotelSlug={hotel.slug} initialOrders={initialOrders} />
      )}
    </div>
  );
}
