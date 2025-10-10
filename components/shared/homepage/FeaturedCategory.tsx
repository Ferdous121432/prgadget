import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { DollarSign, Headset, ShoppingBag, WalletCards } from "lucide-react";
import Image from "next/image";
import React from "react";
import apple from "./../../../assets/icons/apple.png";
import tablet from "./../../../assets/icons/tablet.png";
import { getFeaturedCategories } from "@/lib/actions/category.actions";
import Link from "next/link";
import { Feature } from "next/dist/build/webpack/plugins/telemetry-plugin/telemetry-plugin";
import { FeaturedCategories } from "@/types";

// const categories = [
//   {
//     name: "Laptop",
//     icon: apple,
//   },
//   {
//     name: "Tablet",
//     icon: tablet,
//   }
// ];

async function FeaturedCategory() {
  const { data: categories } = (await getFeaturedCategories()) as any;
  // console.log("Categories:", categories);

  return (
    <div>
      <Card>
        <CardTitle className="text-xl w-full text-center font-bold p-4">
          Featured Categories
        </CardTitle>
        <CardContent className="grid grid-cols-2 md:grid-cols-8 gap-4 p-4 justify-center items-center">
          {categories.map((category: FeaturedCategories) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <div className="space-y-2 justify-center items-center flex flex-col">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={50}
                    height={50}
                    priority
                  />
                </div>
                <div className="text-sm capitalize font-bold">
                  {category.name}
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default FeaturedCategory;
