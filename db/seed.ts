import { PrismaClient } from "@/lib/generated/prisma";
import sampleData from "./sample-data";
import { hashSync } from "bcrypt-ts-edge";

async function main() {
  const prisma = new PrismaClient();
  await prisma.product.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  await prisma.product.createMany({ data: sampleData.products });
  const users = [];
  for (let i = 0; i < sampleData.users.length; i++) {
    users.push({
      ...sampleData.users[i],
      password: await hashSync(sampleData.users[i].password, 10),
    });
    console.log(
      sampleData.users[i].password,
      await hashSync(sampleData.users[i].password, 10)
    );
  }
  await prisma.user.createMany({ data: users });

  console.log("Database seeded successfully!");
}

main();
