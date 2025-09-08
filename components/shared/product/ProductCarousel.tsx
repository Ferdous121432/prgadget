"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Product } from "@/types";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import Image from "next/image";

const ProductCarousel = ({ data }: { data: any }) => {
  console.log("Carousel Data:", data);
  return (
    <Carousel
      className="w-full mb-12"
      opts={{
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 5000,
          stopOnInteraction: false,
          stopOnMouseEnter: false,
        }),
      ]}>
      <CarouselContent>
        {data.map((slider: any) => (
          <CarouselItem key={slider.id}>
            <Link href={slider.linked_url || "#"}>
              <div className="relative mx-auto">
                <Image
                  src={slider.image_url!}
                  alt={slider.image_url!}
                  width="0"
                  height="0"
                  sizes="100vw"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 flex items-end justify-center">
                  <h2 className="bg-gray-900 bg-opacity-50 text-2xl font-bold px-2 text-white">
                    {slider.name}
                  </h2>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* <CarouselPrevious className="hidden md:block " />
      <CarouselNext className="hidden md:block" /> */}
    </Carousel>
  );
};

export default ProductCarousel;
