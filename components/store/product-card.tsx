"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  stock: number;
  category: {
    name: string;
  } | null;
};

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const discountPercentage =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) /
            product.compareAtPrice) *
            100
        )
      : null;

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    // Prevent navigating to product page when clicking button
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      slug: product.slug,
      image: product.images[0],
      stock: product.stock,
    });

    // Show "Added!" feedback briefly
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 group flex flex-col py-0 rounded-none">
      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="relative block">
        <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
          {product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingBag className="h-10 w-10 mb-2" />
              <p className="text-xs">No image</p>
            </div>
          )}

          {/* Discount Badge */}
          {discountPercentage && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs px-1.5 py-0.5">
                -{discountPercentage}%
              </Badge>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Badge variant="secondary" className="bg-gray-800 text-white">
                Out of Stock
              </Badge>
            </div>
          )}

          {/* Low Stock Badge */}
          {isLowStock && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-orange-500 hover:bg-orange-500 text-white text-xs px-1.5 py-0.5">
                Only {product.stock} left
              </Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <CardContent className="ps-3 md:p-3 flex-1">
        {product.category && (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.category.name}
          </p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium md:text-lg leading-tight transition-colors line-clamp-2 min-h-10">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center lg:gap-2">
          <span className="text-base font-bold text-red-400">
            GH₵ {product.price.toFixed(2)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              GH₵ {product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>

      {/* Action Buttons */}
      <CardFooter className="p-3 pt-0 flex flex-col gap-2">
        {/* Add to Cart Button */}
        <Button
        className="h-8 text-xs w-full bg-black rounded-none"
          disabled={isOutOfStock || isAdded}
          variant={isAdded ? "secondary" : "default"}
          onClick={handleAddToCart}
        >
          {isAdded ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Added!
            </>
          ) : isOutOfStock ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="h-3 w-3 mr-1" />
              Add to Cart
            </>
          )}
        </Button>

        {/* View Details Button */}
        <Button
          variant="outline"
          className="h-8 text-xs w-full rounded-none"
          asChild
        >
          <Link href={`/products/${product.slug}`}>
            View
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}