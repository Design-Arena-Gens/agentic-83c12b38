import { formatCurrency } from "@/lib/format";

type Props = {
  analytics:
    | {
        totalOrders: number;
        totalRevenue: number;
        avgRating: number;
        reviewCount: number;
      }
    | null;
  outstandingOrders: number;
  totalMenuItems: number;
};

export function MetricsSummary({ analytics, outstandingOrders, totalMenuItems }: Props) {
  const cards = [
    {
      title: "Lifetime revenue",
      value: analytics ? formatCurrency(analytics.totalRevenue) : "–",
      description: analytics ? `${analytics.totalOrders} total orders processed` : "No orders yet",
    },
    {
      title: "Guest satisfaction",
      value: analytics ? `${analytics.avgRating.toFixed(1)} ★` : "–",
      description: analytics ? `${analytics.reviewCount} collected ratings` : "Collect your first ratings",
    },
    {
      title: "Active orders",
      value: outstandingOrders.toString(),
      description: "Orders not yet completed",
    },
    {
      title: "Menu items",
      value: totalMenuItems.toString(),
      description: "Manage availability and pricing",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{card.title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          <p className="mt-1 text-sm text-slate-500">{card.description}</p>
        </div>
      ))}
    </section>
  );
}
