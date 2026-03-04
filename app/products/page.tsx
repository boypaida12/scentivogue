import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Prisma } from "@prisma/client";
import StoreLayout from "@/components/store/store-layout";
import ProductCard from "@/components/store/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  // Fetch categories for filter
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  // Build filter query
  const whereClause: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (category) {
    whereClause.categoryId = category;
  }

  // Fetch products
  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <StoreLayout>
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-lg border p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Categories</h2>
              <div className="space-y-2">
                <Link href="/products">
                  <Button
                    variant={!category ? "default" : "ghost"}
                    className={`w-full justify-start ${!category ? "bg-black hover:bg-black" : "bg-transparent"}`}
                  >
                    All Products
                  </Button>
                </Link>
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/products?category=${cat.id}`}>
                    <Button
                      variant={category === cat.id ? "default" : "ghost"}
                      className={`w-full justify-start ${category === cat.id ? "bg-black hover:bg-black" : "bg-transparent"}`}
                    >
                      {cat.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
          <main className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">
                {category
                  ? categories.find((c) => c.id === category)?.name ||
                    "Products"
                  : "All Products"}
              </h1>
              <p className="text-gray-600 mt-2">
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"} found
              </p>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">
                  No products found in this category
                </p>
                <Button variant="outline" asChild>
                  <Link href="/products">View All Products</Link>
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Carousel
                  opts={{
                    align: "start",
                    loop: false,
                  }}
                >
                  <CarouselContent className="py-2">
                    {products.map((product) => (
                      <CarouselItem
                        key={product.id}
                        className="max-[24rem]:basis-2/3 max-md:basis-1/2 basis-1/3 xl:basis-1/4"
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
            )}
          </main>
        </div>
      </div>
    </StoreLayout>
  );
}
