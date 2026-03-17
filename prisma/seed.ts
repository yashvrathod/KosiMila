import { PrismaClient } from "@/app/generated/prisma";
import bcrypt from "bcryptjs";

import { PrismaPg } from "@prisma/adapter-pg";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL env var");
  }

  try {
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({ 
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  } catch (error) {
    console.error("Failed to initialize Prisma client:", error);
    throw error;
  }
};

declare global {
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";
  const adminName = process.env.SEED_ADMIN_NAME || "Admin";

  const hashed = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: "ADMIN",
      // keep existing password unless you explicitly want to reset:
      // password: hashed,
    },
    create: {
      name: adminName,
      email: adminEmail,
      password: hashed,
      role: "ADMIN",
    },
    select: { id: true, email: true, role: true },
  });

  // Ensure settings row exists (if your app expects it)
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "My Store",
      siteDescription: "Demo ecommerce store",
      taxRate: 0,
      currency: "INR",
    },
  });

  // LADOOZI Categories
 // ================= CATEGORIES =================

const roasted = await prisma.category.upsert({
  where: { slug: "roasted-makhana" },
  update: {},
  create: {
    name: "Roasted Makhana",
    slug: "roasted-makhana",
    description: "Classic roasted makhana with light seasoning",
  },
});

const flavored = await prisma.category.upsert({
  where: { slug: "flavored-makhana" },
  update: {},
  create: {
    name: "Flavored Makhana",
    slug: "flavored-makhana",
    description: "Delicious makhana with exciting flavors",
  },
});

const combos = await prisma.category.upsert({
  where: { slug: "combo-packs" },
  update: {},
  create: {
    name: "Combo Packs",
    slug: "combo-packs",
    description: "Value packs for daily snacking",
  },
});

const gifting = await prisma.category.upsert({
  where: { slug: "gifting" },
  update: {},
  create: {
    name: "Gifting Packs",
    slug: "gifting",
    description: "Premium makhana gift boxes",
  },
});

// ================= PRODUCTS =================

// ROASTED
await prisma.product.upsert({
  where: { slug: "classic-roasted-makhana" },
  update: {},
  create: {
    name: "Classic Roasted Makhana",
    slug: "classic-roasted-makhana",
    description: "Lightly roasted makhana with a perfect crunch. A healthy everyday snack.",
    price: 199,
    comparePrice: 249,
    stock: 100,
    images: ["https://via.placeholder.com/600x600.png?text=Roasted+Makhana"],
    categoryId: roasted.id,
    brand: "Kosimila",
    highlights: ["Low calorie", "High protein", "Roasted not fried", "Gluten free"],
    featured: true,
    active: true,
  },
});

// FLAVORED
await prisma.product.upsert({
  where: { slug: "peri-peri-makhana" },
  update: {},
  create: {
    name: "Peri Peri Makhana",
    slug: "peri-peri-makhana",
    description: "Spicy peri peri flavored makhana for a bold snacking experience.",
    price: 249,
    comparePrice: 299,
    stock: 80,
    images: ["https://via.placeholder.com/600x600.png?text=Peri+Peri"],
    categoryId: flavored.id,
    brand: "Kosimila",
    highlights: ["Spicy flavor", "Crunchy texture", "Healthy snack", "No preservatives"],
    featured: true,
    active: true,
  },
});

await prisma.product.upsert({
  where: { slug: "cheese-makhana" },
  update: {},
  create: {
    name: "Cheese Makhana",
    slug: "cheese-makhana",
    description: "Creamy cheese flavored makhana loved by all age groups.",
    price: 249,
    comparePrice: 299,
    stock: 80,
    images: ["https://via.placeholder.com/600x600.png?text=Cheese"],
    categoryId: flavored.id,
    brand: "Kosimila",
    highlights: ["Cheesy taste", "Kids favorite", "Light snack", "Rich flavor"],
    featured: true,
    active: true,
  },
});

// COMBO
await prisma.product.upsert({
  where: { slug: "daily-snack-combo" },
  update: {},
  create: {
    name: "Daily Snack Combo",
    slug: "daily-snack-combo",
    description: "A mix of roasted and flavored makhana for daily snacking.",
    price: 499,
    comparePrice: 599,
    stock: 60,
    images: ["https://via.placeholder.com/600x600.png?text=Combo"],
    categoryId: combos.id,
    brand: "Kosimila",
    highlights: ["Value pack", "Multiple flavors", "Family pack", "Healthy combo"],
    featured: true,
    active: true,
  },
});

// GIFTING
await prisma.product.upsert({
  where: { slug: "premium-gift-box" },
  update: {},
  create: {
    name: "Premium Makhana Gift Box",
    slug: "premium-gift-box",
    description: "Beautifully packed premium makhana box perfect for gifting.",
    price: 899,
    comparePrice: 1099,
    stock: 40,
    images: ["https://via.placeholder.com/600x600.png?text=Gift+Box"],
    categoryId: gifting.id,
    brand: "Kosimila",
    highlights: ["Premium packaging", "Perfect for gifting", "Multiple flavors", "Festive special"],
    featured: true,
    active: true,
  },
});

// ================= BANNER =================

await prisma.banner.upsert({
  where: { id: "banner-1" },
  update: {},
  create: {
    id: "banner-1",
    title: "Premium Roasted Makhana",
    subtitle: "Light • Crunchy • Healthy",
    image: "/images/banner.png",
    link: "/products",
    active: true,
    order: 1,
  },
});
  console.log("Seed complete - LADOOZI data created!");
  console.log("Admin:", admin.email, admin.role);
  console.log("Admin password:", adminPassword);
  console.log("Categories created: 7");
  console.log("Products created: 13");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
