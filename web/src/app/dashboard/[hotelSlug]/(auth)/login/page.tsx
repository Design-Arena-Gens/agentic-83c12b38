import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LoginForm } from "@/components/dashboard/LoginForm";

type PageProps = {
  params: { hotelSlug: string };
};

export default async function DashboardLoginPage({ params }: PageProps) {
  const hotel = await prisma.hotel.findUnique({
    where: { slug: params.hotelSlug },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!hotel) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-xl backdrop-blur">
        <Link href="/" className="text-sm text-slate-300 transition hover:text-white">
          ← Back to overview
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">
          {hotel.name} staff dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Enter your team PIN to manage menus, orders, and tables.
        </p>
        <LoginForm hotelSlug={hotel.slug} />
      </div>
    </div>
  );
}
