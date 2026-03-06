import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import StoreLayout from "@/components/store/store-layout";
import ProductCard from "@/components/store/product-card";
import ProductFilters from "@/components/store/product-filters";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type SearchParams = {
  category?: string;
  [key: string]: string | string[] | undefined;
};

async function ProductsContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Fetch categories for category filter
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  // Fetch all active products with variants
  const allProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(searchParams.category && {
        categoryId: searchParams.category,
      }),
    },
    include: {
      category: true,
      variants: true, 
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Compute available filters from products (only variant products)
  const filterMap = new Map<string, Map<string, number>>();

  allProducts.forEach((product) => {
    if (product.hasVariants && product.variants) {
      product.variants.forEach((variant) => {
        const attributes = variant.attributes as Record<string, string>;
        
        Object.entries(attributes).forEach(([filterName, filterValue]) => {
          if (!filterMap.has(filterName)) {
            filterMap.set(filterName, new Map());
          }
          
          const valueMap = filterMap.get(filterName)!;
          valueMap.set(filterValue, (valueMap.get(filterValue) || 0) + 1);
        });
      });
    }
  });

  // Convert to filter format
  const filters = Array.from(filterMap.entries()).map(([name, valueMap]) => ({
    name,
    options: Array.from(valueMap.entries())
      .map(([value, count]) => ({ name: value, count }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));

  // Apply attribute filters to products
  const selectedFilters: Record<string, string[]> = {};
  filters.forEach((filter) => {
    const param = searchParams[filter.name];
    if (param) {
      selectedFilters[filter.name] = typeof param === "string" 
        ? param.split(",") 
        : param;
    }
  });

  const hasActiveFilters = Object.keys(selectedFilters).length > 0;

  const filteredProducts = hasActiveFilters
    ? allProducts.filter((product) => {
        if (!product.hasVariants || !product.variants) return false;

        // Check if any variant matches ALL selected filters
        return product.variants.some((variant) => {
          const attributes = variant.attributes as Record<string, string>;
          
          return Object.entries(selectedFilters).every(
            ([filterName, selectedValues]) => {
              const variantValue = attributes[filterName];
              return selectedValues.includes(variantValue);
            }
          );
        });
      })
    : allProducts;

  const currentCategory = searchParams.category
    ? categories.find((c) => c.id === searchParams.category)
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar with Categories and Filters */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-lg border p-6 sticky top-24 space-y-8">
            {/* Categories */}
            <div>
              <h2 className="text-xl font-bold mb-4">Categories</h2>
              <div className="space-y-2">
                <Link href="/products">
                  <Button
                    variant={!searchParams.category ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      !searchParams.category
                        ? "bg-black hover:bg-black"
                        : "bg-transparent"
                    }`}
                  >
                    All Products
                  </Button>
                </Link>
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/products?category=${cat.id}`}>
                    <Button
                      variant={
                        searchParams.category === cat.id ? "default" : "ghost"
                      }
                      className={`w-full justify-start ${
                        searchParams.category === cat.id
                          ? "bg-black hover:bg-black"
                          : "bg-transparent"
                      }`}
                    >
                      {cat.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Attribute Filters */}
            {filters.length > 0 && (
              <div className="border-t pt-6">
                <ProductFilters filters={filters} />
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">
              {currentCategory ? currentCategory.name : "All Products"}
            </h1>
            <p className="text-gray-600 mt-2">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"} found
              {hasActiveFilters && " matching your filters"}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">
                {hasActiveFilters
                  ? "No products found matching your filters"
                  : "No products found in this category"}
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
                  {filteredProducts.map((product) => (
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
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <StoreLayout>
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          </div>
        }
      >
        <ProductsContent searchParams={params} />
      </Suspense>
    </StoreLayout>
  );
}