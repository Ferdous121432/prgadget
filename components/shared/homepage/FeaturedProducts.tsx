import { assets } from "@/assets/assets";
import Image from "next/image";

const products = [
  {
    id: 1,
    image: assets.girl_with_headphone_image,
    title: "Unparalleled Sound",
    description: "Experience crystal-clear audio with premium headphones.",
  },
  {
    id: 2,
    image: assets.girl_with_earphone_image,
    title: "Stay Connected",
    description: "Compact and stylish earphones for every occasion.",
  },
  {
    id: 3,
    image: assets.boy_with_laptop_image,
    title: "Power in Every Pixel",
    description: "Shop the latest laptops for work, gaming, and more.",
  },
];

const FeaturedProduct = () => {
  return (
    <section className="space-y-10">
      <div className="flex flex-col items-center">
        <p className="text-center text-3xl font-medium">Featured Products</p>
        <div className="mt-2 h-0.5 w-28 bg-destructive"></div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        {products.map(({ id, image, title, description }) => (
          <div
            key={id}
            className="group relative overflow-hidden rounded-4xl bg-stone-200">
            <div className="aspect-4/5">
              <Image
                src={image}
                alt={title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-75"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-stone-950/90 via-stone-950/45 to-transparent p-6 text-white sm:p-8">
              <div className="space-y-2 transition duration-300 group-hover:-translate-y-2">
                <p className="font-medium text-xl lg:text-2xl">{title}</p>
                <p className="max-w-60 text-sm leading-5 lg:text-base">
                  {description}
                </p>
                <button className="flex items-center gap-1.5 rounded bg-destructive px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
                  Buy now
                  <Image
                    className="h-3 w-3"
                    src={assets.redirect_icon}
                    alt="Redirect Icon"
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProduct;
