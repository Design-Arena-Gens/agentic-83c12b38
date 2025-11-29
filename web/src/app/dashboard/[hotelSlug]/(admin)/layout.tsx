import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

type LayoutProps = {
  params: Promise<{ hotelSlug: string }>;
  children: React.ReactNode;
};

export default async function DashboardAdminLayout({ params, children }: LayoutProps) {
  const { hotelSlug } = await params;
  const hotel = await prisma.hotel.findUnique({
    where: { slug: hotelSlug },
    include: {
      analytics: true,
    },
  });

  if (!hotel) {
    redirect("/");
  }

  const session = await getAdminSession();
  if (!session || session.hotelId !== hotel.id) {
    redirect(`/dashboard/${hotel.slug}/login`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav
        hotel={{
          id: hotel.id,
          name: hotel.name,
          slug: hotel.slug,
          analytics: hotel.analytics ?? null,
        }}
      />
      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-6">{children}</main>
    </div>
  );
}
