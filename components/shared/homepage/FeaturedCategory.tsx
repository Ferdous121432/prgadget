import Image, { StaticImageData } from "next/image";
// import { getFeaturedCategories } from "@/lib/actions/category.actions";
import Link from "next/link";

type FeaturedCategories = {
  id: number;
  name: string;
  link?: string;
  image: StaticImageData;
};

async function FeaturedCategory({
  categories,
}: {
  categories: FeaturedCategories[];
}) {
  // const { data: categories } = (await getFeaturedCategories()) as any;

  return (
    <div className="bg-slate-100 dark:bg-gray-800">
      <div className="border rounded-lg">
        <div className="text-xl w-full text-center font-bold p-4">
          Featured Categories
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4 p-4 justify-center items-center">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.link}`}>
              <div className="space-y-2 justify-center items-center flex flex-col">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={50}
                    height={50}
                    loading="lazy"
                    sizes="50px"
                  />
                </div>
                <div className="text-sm capitalize font-bold">
                  {category.name}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeaturedCategory;
