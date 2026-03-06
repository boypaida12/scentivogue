import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StoreLayout from "@/components/store/store-layout";
import ProductCard from "@/components/store/product-card";
import TestimonialCarousel from "@/components/store/testimonials";
import { ShoppingBag, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default async function HomePage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const featuredProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      isFeatured: true,
    },
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const newArrivals = await prisma.product.findMany({
    where: {
      isActive: true,
      createdAt: { gte: thirtyDaysAgo },
    },
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const yourImageUrl =
    "https://res.cloudinary.com/dciojpfwx/image/upload/v1772812253/ulysse-pointcheval--j6LLsAehUo-unsplash_losqkd.jpg";

  return (
    <StoreLayout>
      {/* ── Hero ────────────────────────────────────────── */}
      <section
        style={{ backgroundImage: `url(${yourImageUrl})` }}
        className="relative py-20 bg-cover bg-center md:min-h-[78vh] flex flex-col items-center justify-center after:absolute after:inset-0 after:content-[''] after:bg-black/70 after:opacity-50 after:z-10"
      >
        <div className="md:w-3xl mx-auto px-4 text-center z-50">
          <h1 className="text-5xl font-bold mb-4 text-white">
            Your trusted perfume plug.
          </h1>
          <p className="text-xl text-white mb-8">
            Premium quality, easy ordering online.
          </p>
          <Link href="/products">
            <Button
              size="lg"
              className="bg-black border border-white rounded-none hover:bg-transparent text-white cursor-pointer"
            >
              <ShoppingBag />
              Shop Now
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Featured Products ───────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-16">
              <div>
                <h2 className="text-3xl font-bold">Featured Products</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Hand-picked favourites just for you
                </p>
              </div>
              <Button
                className="hover:bg-black text-black border border-black rounded-none bg-transparent hover:text-white cursor-pointer"
                asChild
              >
                <Link href="/products" className="flex items-center gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <Carousel
                opts={{
                  align: "start",
                  loop: false,
                }}
              >
                <CarouselContent className="py-2">
                  {featuredProducts.map((product) => (
                    <CarouselItem
                      key={product.id}
                      className="max-[24rem]:basis-2/3 max-md:basis-1/2 basis-1/4 xl:basis-1/6"
                    >
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="absolute -top-12 right-0 flex gap-2">
                  <CarouselPrevious className="static translate-y-0 text-black" />
                  <CarouselNext className="static translate-y-0 text-black" />
                </div>
              </Carousel>
            </div>
          </div>
        </section>
      )}

      {/* ── New Arrivals ─────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-16">
              <div>
                <h2 className="text-3xl font-bold">New Arrivals</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Fresh additions to our collection
                </p>
              </div>
              <Button
                asChild
                className="bg-black border border-black rounded-none hover:bg-transparent hover:text-black cursor-pointer"
              >
                <Link href="/products" className="flex items-center gap-1">
                  See More
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <Carousel
                opts={{
                  align: "start",
                  loop: false,
                }}
              >
                <CarouselContent className="py-2">
                  {newArrivals.map((product) => (
                    <CarouselItem
                      key={product.id}
                      className="max-[24rem]:basis-2/3 max-md:basis-1/2 basis-1/4 xl:basis-1/6"
                    >
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="absolute -top-12 right-0 flex gap-2">
                  <CarouselPrevious className="static translate-y-0 text-black" />
                  <CarouselNext className="static translate-y-0 text-black" />
                </div>
              </Carousel>
            </div>
          </div>
        </section>
      )}

      {/* ── Empty State ───────────────────────────────────── */}
      {allProducts.length === 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-gray-50 rounded-lg py-16">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">
                No products available yet
              </p>
              <p className="text-gray-400 text-sm">
                Check back soon for new arrivals!
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ─────────────────────────────────── */}
      <TestimonialCarousel />
    </StoreLayout>
  );
}
