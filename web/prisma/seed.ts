import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/slugify";

const prisma = new PrismaClient();

async function main() {
  const hotels = [
    {
      name: "Aurora Grand Hotel",
      slug: "aurora-grand",
      logoUrl: "https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?auto=format&fit=crop&w=300&q=80",
      googleReviewUrl: "https://g.page/r/CVTnY_auroragrand/review",
      adminPin: "4321",
      description: "Upscale business hotel with fine dining and rooftop bar.",
      menuCategories: [
        {
          name: "Starters",
          items: [
            {
              name: "Truffle Arancini",
              description: "Crispy risotto balls with truffle aioli",
              price: 12.5,
              imageUrl: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=400&q=80",
            },
            {
              name: "Citrus Shrimp Ceviche",
              description: "Fresh shrimp cured with lime and orange, served with plantain chips",
              price: 14.0,
            },
          ],
        },
        {
          name: "Mains",
          items: [
            {
              name: "Grilled Salmon Nicoise",
              description: "Seared salmon, haricots verts, olives, soft egg",
              price: 28.0,
              imageUrl: "https://images.unsplash.com/photo-1612874470028-52002a0f5194?auto=format&fit=crop&w=400&q=80",
            },
            {
              name: "Herb-Crusted Lamb Rack",
              description: "Served with roasted root vegetables and rosemary jus",
              price: 34.0,
            },
          ],
        },
        {
          name: "Desserts",
          items: [
            {
              name: "Dark Chocolate Tart",
              description: "Served with raspberry coulis and Chantilly cream",
              price: 12.0,
            },
          ],
        },
        {
          name: "Drinks",
          items: [
            {
              name: "Signature Old Fashioned",
              description: "House barrel-aged bourbon with citrus bitters",
              price: 16.0,
            },
            {
              name: "Sparkling Elderflower",
              description: "Elderflower tonic with fresh mint and lime",
              price: 9.5,
            },
          ],
        },
      ],
      tables: [
        { name: "Table 1" },
        { name: "Table 2" },
        { name: "Table 3" },
        { name: "Terrace 1" },
      ],
    },
    {
      name: "Coastal Breeze Resort",
      slug: "coastal-breeze",
      logoUrl: "https://images.unsplash.com/photo-1501117716987-c8e2a9003c70?auto=format&fit=crop&w=300&q=80",
      googleReviewUrl: "https://g.page/r/CVTnY_coastalbreeze/review",
      adminPin: "9876",
      description: "Beachfront resort focused on relaxed luxury and wellness.",
      menuCategories: [
        {
          name: "Breakfast",
          items: [
            {
              name: "Tropical Açai Bowl",
              description: "Acai with granola, mango, pineapple, toasted coconut",
              price: 11.0,
            },
            {
              name: "Coastal Benedict",
              description: "Crab cakes topped with poached eggs and citrus hollandaise",
              price: 18.0,
            },
          ],
        },
        {
          name: "Lunch & Dinner",
          items: [
            {
              name: "Seared Tuna Poke",
              description: "Sesame tuna with sushi rice, avocado, seaweed salad",
              price: 22.0,
            },
            {
              name: "Coconut Curry Bowl",
              description: "Seasonal vegetables, jasmine rice, toasted cashews",
              price: 19.0,
            },
          ],
        },
        {
          name: "Cocktails",
          items: [
            {
              name: "Sunset Spritz",
              description: "Sparkling wine, passionfruit, orange bitters",
              price: 13.0,
            },
            {
              name: "Pineapple Mojito",
              description: "Fresh pineapple, mint, rum, lime, sparkling water",
              price: 12.0,
            },
          ],
        },
      ],
      tables: [
        { name: "Beach Cabana 1" },
        { name: "Beach Cabana 2" },
        { name: "Pool Deck 1" },
        { name: "Pool Deck 2" },
        { name: "Restaurant 5" },
      ],
    },
  ];

  for (const hotel of hotels) {
    const createdHotel = await prisma.hotel.upsert({
      where: { slug: hotel.slug },
      update: {},
      create: {
        name: hotel.name,
        slug: hotel.slug,
        logoUrl: hotel.logoUrl,
        googleReviewUrl: hotel.googleReviewUrl,
        adminPin: hotel.adminPin,
        description: hotel.description,
        analytics: {
          create: {
            totalOrders: 0,
            totalRevenue: 0,
            avgRating: 0,
            reviewCount: 0,
          },
        },
      },
    });

    for (const category of hotel.menuCategories) {
      const createdCategory = await prisma.menuCategory.upsert({
        where: {
          hotelId_name: {
            hotelId: createdHotel.id,
            name: category.name,
          },
        },
        update: {},
        create: {
          name: category.name,
          hotelId: createdHotel.id,
        },
      });

      for (const item of category.items) {
        await prisma.menuItem.upsert({
          where: {
            hotelId_name: {
              hotelId: createdHotel.id,
              name: item.name,
            },
          },
          update: {},
          create: {
            name: item.name,
            description: item.description,
            price: item.price,
            imageUrl: item.imageUrl,
            hotelId: createdHotel.id,
            categoryId: createdCategory.id,
          },
        });
      }
    }

    for (const table of hotel.tables) {
      const slug = slugify(`${createdHotel.slug}-${table.name}`);
      await prisma.table.upsert({
        where: { qrSlug: slug },
        update: {},
        create: {
          name: table.name,
          qrSlug: slug,
          hotelId: createdHotel.id,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
