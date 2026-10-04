import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  images: string[];
  hasVariants: boolean;
  // ✅ NEW: Bundle fields
  productType?: string;
  bundlePrice?: number | null;
  bundleCompareAtPrice?: number | null;
  bundleItems?: Array<{
    id: string;
    name: string;
    stock: number;
  }>;
  category?: {
    id: string;
    name: string;
  } | null;
  variants?: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
    compareAtPrice: number | null;
  }>;
};

export default function ProductCard({ product }: { product: Product }) {
  // ✅ UPDATED: Helper function to get display data
  const getDisplayData = () => {
    const isBundle = product.productType === "bundle";

    // Bundle products
    if (isBundle) {
      const bundleItemStock = product.bundleItems?.reduce(
        (sum, item) => sum + item.stock,
        0
      ) || 0;

      const hasDiscount =
        product.bundleCompareAtPrice &&
        product.bundleCompareAtPrice > (product.bundlePrice || 0);

      return {
        price: product.bundlePrice,
        priceRange: null,
        stock: bundleItemStock,
        hasDiscount,
        type: "bundle",
      };
    }

    // Variant products
    if (
      product.hasVariants &&
      product.variants &&
      product.variants.length > 0
    ) {
      const prices = product.variants.map((v) => v.price);
      const stocks = product.variants.map((v) => v.stock);

      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const totalStock = stocks.reduce((sum, s) => sum + s, 0);
      const hasDiscount = product.variants.some(
        (v) => v.compareAtPrice && v.compareAtPrice > v.price,
      );

      return {
        price: minPrice === maxPrice ? minPrice : null,
        priceRange:
          minPrice !== maxPrice ? { min: minPrice, max: maxPrice } : null,
        stock: totalStock,
        hasDiscount,
        type: "variant",
      };
    }

    // Simple product
    return {
      price: product.price,
      priceRange: null,
      stock: product.stock,
      hasDiscount: product.compareAtPrice
        ? product.compareAtPrice > product.price
        : false,
      type: "simple",
    };
  };

  const displayData = getDisplayData();
  const isOutOfStock = displayData.stock === 0;

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group shadow-none overflow-hidden rounded-none py-0 gap-2 h-90">
        <div className="relative aspect-square overflow-hidden bg-gray-100 h-3/5">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}

          {isOutOfStock && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Out of Stock
            </Badge>
          )}

          {displayData.hasDiscount && !isOutOfStock && (
            <Badge className="absolute top-2 right-2 bg-red-500">Sale</Badge>
          )}

          {/* ✅ NEW: Bundle badge */}
          {displayData.type === "bundle" && !isOutOfStock && (
            <Badge className="absolute top-2 left-2 bg-blue-500">Bundle</Badge>
          )}
        </div>

        <CardContent className="px-4">
          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {product.category && (
            <p className="text-sm text-gray-500">
              {product.category.name}
            </p>
          )}

          <div className="flex items-baseline gap-2">
            {displayData.priceRange ? (
              <p className="text-lg font-bold text-red-400">
                GH₵ {displayData.priceRange.min.toFixed(2)} - GH₵{" "}
                {displayData.priceRange.max.toFixed(2)}
              </p>
            ) : (
              <>
                <p className="text-lg font-bold text-red-400">
                  GH₵ {displayData.price?.toFixed(2)}
                </p>
                {displayData.hasDiscount &&
                  (displayData.type === "bundle"
                    ? product.bundleCompareAtPrice
                    : product.compareAtPrice) && (
                    <p className="text-sm text-gray-500 line-through">
                      GH₵{" "}
                      {displayData.type === "bundle"
                        ? product.bundleCompareAtPrice?.toFixed(2)
                        : product.compareAtPrice?.toFixed(2)}
                    </p>
                  )}
              </>
            )}
          </div>

          {/* ✅ NEW: Show bundle info */}
          {displayData.type === "bundle" && product.bundleItems && (
            <p className="text-sm text-gray-500 mt-2">
              {product.bundleItems.length} items available
            </p>
          )}

          {/* Variant options */}
          {displayData.type === "variant" &&
            product.variants &&
            product.variants.length > 1 && (
              <p className="text-sm text-gray-500 my-2">
                {product.variants.length} options available
              </p>
            )}
        </CardContent>
      </Card>
    </Link>
  );
}