import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrderExperience } from "@/components/order/OrderExperience";

type PageProps = {
  params: { hotelSlug: string; tableSlug: string };
};

export default async function TableOrderPage({ params }: PageProps) {
  const hotel = await prisma.hotel.findUnique({
    where: { slug: params.hotelSlug },
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
    },
  });

  if (!hotel) {
    notFound();
  }

  const table = await prisma.table.findUnique({
    where: { qrSlug: params.tableSlug },
    select: {
      id: true,
      name: true,
      hotelId: true,
    },
  });

  if (!table || table.hotelId !== hotel.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm text-slate-500">Ordering at</p>
            <h1 className="text-xl font-semibold text-slate-900">{hotel.name}</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Powered by QuickServe
          </Link>
        </div>
      </header>
      <OrderExperience
        hotel={{
          id: hotel.id,
          name: hotel.name,
          slug: hotel.slug,
          logoUrl: hotel.logoUrl,
        }}
        table={{
          id: table.id,
          name: table.name,
          slug: params.tableSlug,
        }}
        categories={hotel.menuCategories.map((category) => ({
          id: category.id,
          name: category.name,
          items: category.items.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            imageUrl: item.imageUrl,
          })),
        }))}
      />
    </div>
  );
}
