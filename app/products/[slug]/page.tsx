import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package } from "lucide-react";
import AddToCartButton from "@/components/store/add-to-cart-button";
import StoreLayout from "@/components/store/store-layout";
import ProductCard from "@/components/store/product-card";
import ProductImageGallery from "@/components/store/product-image-gallery";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  // Calculate discount percentage
  const discountPercentage =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : null;

  // Fetch related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    include: {
      category: true,
    },
  });

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-900">
            Products
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/products?category=${product.categoryId}`}
                className="hover:text-gray-900"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        {/* Product Detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <ProductImageGallery
            images={product.images}
            productName={product.name}
          />
          {/* Product Info */}
          <div className="space-y-6">
            {product.category && (
              <Badge variant="secondary">{product.category.name}</Badge>
            )}
            <h1 className="text-4xl font-bold">{product.name}</h1>
            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-red-400">
                GH₵ {product.price.toFixed(2)}
              </span>
              {product.compareAtPrice &&
                product.compareAtPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      GH₵ {product.compareAtPrice.toFixed(2)}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-800"
                    >
                      Save {discountPercentage}%
                    </Badge>
                  </>
                )}
            </div>
            {/* Stock Status */}
            <div>
              {product.stock === 0 ? (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Out of Stock
                </Badge>
              ) : product.stock < 5 ? (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800"
                >
                  Only {product.stock} left in stock
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  In Stock
                </Badge>
              )}
            </div>
            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
            {/* Product Details */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Product Details</h3>
              <div className="space-y-2 text-sm">
                {product.sku && (
                  <div className="flex">
                    <span className="text-gray-600 w-24">SKU:</span>
                    <span className="font-medium">{product.sku}</span>
                  </div>
                )}
                <div className="flex">
                  <span className="text-gray-600 w-24">Stock:</span>
                  <span className="font-medium">{product.stock} available</span>
                </div>
              </div>
            </div>
            {/* Add to Cart */}
            <AddToCartButton product={product} />
            {/* Shipping Info */}
            <div className="border-t pt-6 space-y-3">
              {/* <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="font-medium">Free Delivery</p>
                  <p className="text-sm text-gray-600">
                    On orders over GH₵ 200 within Accra
                  </p>
                </div>
              </div> */}
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="font-medium">Easy Returns</p>
                  <p className="text-sm text-gray-600">
                    7-day return policy for unused items
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
