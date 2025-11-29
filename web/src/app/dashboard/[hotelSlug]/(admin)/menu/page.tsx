import { prisma } from "@/lib/prisma";
import { MenuManager } from "@/components/dashboard/MenuManager";

type PageProps = {
  params: { hotelSlug: string };
};

export default async function MenuManagementPage({ params }: PageProps) {
  const hotel = await prisma.hotel.findUnique({
    where: { slug: params.hotelSlug },
    include: {
      menuCategories: {
        include: {
          items: {
            orderBy: { name: "asc" },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!hotel) {
    return null;
  }

  return (
    <MenuManager
      hotelSlug={hotel.slug}
      categories={hotel.menuCategories.map((category) => ({
        id: category.id,
        name: category.name,
        items: category.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          isAvailable: item.isAvailable,
          imageUrl: item.imageUrl,
        })),
      }))}
    />
  );
}
