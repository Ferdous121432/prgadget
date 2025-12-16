"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

const ProductCarousel = ({ data }: { data: any }) => {
  // Memoize the autoplay plugin to prevent recreation on re-renders
  const autoplayPlugin = useMemo(
    () =>
      Autoplay({
        delay: 5000,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
      }),
    []
  );

  return (
    <Carousel
      className="w-full mb-12"
      opts={{
        loop: true,
      }}
      plugins={[autoplayPlugin]}>
      <CarouselContent>
        {data.map((slider: any, index: number) => (
          <CarouselItem key={slider.id}>
            <Link href={slider.linked_url || "#"}>
              <div className="relative mx-auto">
                <Image
                  src={slider.image_url!}
                  alt={slider.image_name || `Banner ${index + 1}`}
                  width={1920}
                  height={600}
                  sizes="100vw"
                  className="w-full h-auto"
                  priority={index === 0}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  loading={index === 0 ? "eager" : "lazy"}
                  quality={index === 0 ? 85 : 75}
                />
                {slider.name && (
                  <div className="absolute inset-0 flex items-end justify-center">
                    <h2 className="bg-gray-900 bg-opacity-50 text-2xl font-bold px-2 text-white">
                      {slider.name}
                    </h2>
                  </div>
                )}
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
