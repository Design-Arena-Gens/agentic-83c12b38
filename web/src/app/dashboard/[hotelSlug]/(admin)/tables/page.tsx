import { prisma } from "@/lib/prisma";
import { generateQrCode } from "@/lib/qr";
import { TableManager } from "@/components/dashboard/TableManager";

type PageProps = {
  params: { hotelSlug: string };
};

export default async function TableManagementPage({ params }: PageProps) {
  const hotel = await prisma.hotel.findUnique({
    where: { slug: params.hotelSlug },
    select: {
      id: true,
      slug: true,
      name: true,
      tables: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!hotel) {
    return null;
  }

  const tables = await Promise.all(
    hotel.tables.map(async (table) => {
      const orderingUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://agentic-83c12b38.vercel.app"}/order/${hotel.slug}/${table.qrSlug}`;
      const qrCode = await generateQrCode(orderingUrl);
      return {
        id: table.id,
        name: table.name,
        qrSlug: table.qrSlug,
        orderingUrl,
        qrCode,
      };
    })
  );

  return <TableManager hotelSlug={hotel.slug} tables={tables} />;
}
