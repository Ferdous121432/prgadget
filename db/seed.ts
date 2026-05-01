import { PrismaClient } from "@/lib/generated/prisma";
import { hashSync } from "bcrypt-ts-edge";
import slugify from "slugify";
import sampleData from "./sample-data";

async function main() {
  const prisma = new PrismaClient();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.mainCategory.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const categoryMap = new Map<string, string>();
  const brandMap = new Map<string, string>();

  for (const brandName of [
    ...new Set(sampleData.products.map((product) => product.brand)),
  ]) {
    const brand = await prisma.brand.create({
      data: {
        name: brandName,
        slug: slugify(brandName, { lower: true, strict: true }),
        image: "/images/sample-products/p1-1.jpg",
        image_key: `seed-brand-${slugify(brandName, { lower: true, strict: true })}`,
      },
    });

    brandMap.set(brandName, brand.id);
  }

  for (const categoryName of [
    ...new Set(sampleData.products.map((product) => product.category)),
  ]) {
    const category = await prisma.mainCategory.create({
      data: {
        name: categoryName,
        slug: slugify(categoryName, { lower: true, strict: true }),
        image: "/images/sample-products/p1-1.jpg",
        image_key: `seed-${slugify(categoryName, { lower: true, strict: true })}`,
      },
    });

    categoryMap.set(categoryName, category.id);
  }

  await prisma.product.createMany({
    data: sampleData.products.map((product) => ({
      name: product.name,
      slug: product.slug,
      description: product.description,
      images: product.images,
      image_keys: product.images.map(
        (image, index) =>
          `seed-${product.slug}-${index + 1}-${image.split("/").pop()}`,
      ),
      brand: product.brand,
      brandId: brandMap.get(product.brand)!,
      stock: product.stock,
      price: product.price,
      rating: product.rating,
      numReviews: product.numReviews,
      isFeatured: product.isFeatured,
      banner: product.banner,
      mainCategoryId: categoryMap.get(product.category)!,
    })),
  });
  const users = [];
  for (let i = 0; i < sampleData.users.length; i++) {
    users.push({
      ...sampleData.users[i],
      password: await hashSync(sampleData.users[i].password, 10),
    });
    console.log(
      sampleData.users[i].password,
      await hashSync(sampleData.users[i].password, 10),
    );
  }
  await prisma.user.createMany({ data: users });

  console.log("Database seeded successfully!");
}

main();
