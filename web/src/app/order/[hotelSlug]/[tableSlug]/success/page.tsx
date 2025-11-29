import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatTimestamp } from "@/lib/format";

type PageProps = {
  params: { hotelSlug: string; tableSlug: string };
  searchParams: { orderId?: string };
};

export default async function OrderSuccessPage({ params, searchParams }: PageProps) {
  const orderId = searchParams.orderId;
  if (!orderId) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      hotel: {
        select: { name: true, slug: true, googleReviewUrl: true },
      },
      table: {
        select: { name: true, qrSlug: true },
      },
      items: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  if (!order || order.hotel.slug !== params.hotelSlug || order.table.qrSlug !== params.tableSlug) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4 py-12">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-md">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-500">Order confirmed</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            Thanks! Your order is now in the kitchen
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            #{order.id.slice(-6).toUpperCase()} • {formatTimestamp(order.createdAt)}
          </p>
          <div className="mt-6 space-y-3 text-left">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.menuItem.name}</p>
                  <p className="text-xs text-slate-500">
                    Qty {item.quantity}
                    {item.instructions ? ` • ${item.instructions}` : ""}
                  </p>
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {formatCurrency(item.lineTotal)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-slate-900 px-6 py-4 text-left text-white">
            <p className="text-sm text-white/70">Order total</p>
            <p className="text-2xl font-semibold">{formatCurrency(order.total)}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={`/order/${order.hotel.slug}/${order.table.qrSlug}`}
              className="w-full rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Add more items
            </Link>
            <Link
              href={`/order/${order.hotel.slug}/${order.table.qrSlug}/rate?orderId=${order.id}`}
              className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Rate this experience
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
