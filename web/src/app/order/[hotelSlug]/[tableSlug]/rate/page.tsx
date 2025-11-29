import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RateOrderForm } from "@/components/order/RateOrderForm";

type PageProps = {
  params: { hotelSlug: string; tableSlug: string };
  searchParams: { orderId?: string };
};

export default async function OrderRatingPage({ params, searchParams }: PageProps) {
  const orderId = searchParams.orderId;
  if (!orderId) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      hotel: {
        select: {
          id: true,
          name: true,
          slug: true,
          googleReviewUrl: true,
        },
      },
      table: {
        select: {
          id: true,
          name: true,
          qrSlug: true,
        },
      },
      rating: true,
    },
  });

  if (!order || order.hotel.slug !== params.hotelSlug || order.table.qrSlug !== params.tableSlug) {
    notFound();
  }

  const alreadyRated = Boolean(order.rating);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-4 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            {order.hotel.name}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">How was everything?</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your feedback helps our hospitality team deliver five-star stays every time.
          </p>

          {alreadyRated ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Thanks for sharing your feedback!</p>
                <p className="mt-1">We’ve saved your rating.</p>
              </div>
              {order.hotel.googleReviewUrl ? (
                <Link
                  href={order.hotel.googleReviewUrl}
                  target="_blank"
                  className="flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Leave a Google review
                </Link>
              ) : null}
              <Link
                href={`/order/${order.hotel.slug}/${order.table.qrSlug}`}
                className="flex w-full items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Back to menu
              </Link>
            </div>
          ) : (
            <RateOrderForm
              orderId={order.id}
              hotelSlug={order.hotel.slug}
              tableSlug={order.table.qrSlug}
              googleReviewUrl={order.hotel.googleReviewUrl ?? null}
            />
          )}
        </div>
      </div>
    </div>
  );
}
