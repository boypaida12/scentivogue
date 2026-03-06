"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

type ProductVariant = {
  id: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  sku: string | null;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  images: string[];
  hasVariants: boolean;
  category: {
    id: string;
    name: string;
  } | null;
  variants: ProductVariant[];
};

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // For variant products, track selected attributes
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >(() => {
    if (!product.hasVariants || product.variants.length === 0) {
      return {};
    }

    // Find first variant with stock
    const inStockVariant = product.variants.find((v) => v.stock > 0);

    if (inStockVariant) {
      // Return attributes from first in-stock variant
      return inStockVariant.attributes;
    }

    // All out of stock - return first variant's attributes as fallback
    return product.variants[0]?.attributes || {};
  });

  // Get all unique attribute names from variants
  const attributeNames = useMemo(() => {
    if (!product.hasVariants || !product.variants.length) return [];

    const names = new Set<string>();
    product.variants.forEach((variant) => {
      Object.keys(variant.attributes).forEach((key) => names.add(key));
    });

    return Array.from(names);
  }, [product.hasVariants, product.variants]);

  // Get available options for each attribute
  const getAttributeOptions = (attributeName: string) => {
    const options = new Set<string>();
    product.variants.forEach((variant) => {
      if (variant.attributes[attributeName]) {
        options.add(variant.attributes[attributeName]);
      }
    });
    return Array.from(options).sort();
  };

  // Find matching variant based on selected attributes
  const selectedVariant = useMemo(() => {
    if (!product.hasVariants) return null;

    // If not all attributes are selected, return null
    if (attributeNames.some((name) => !selectedAttributes[name])) {
      return null;
    }

    // Find variant that matches all selected attributes
    return product.variants.find((variant) => {
      return attributeNames.every(
        (name) => variant.attributes[name] === selectedAttributes[name],
      );
    });
  }, [
    product.hasVariants,
    product.variants,
    attributeNames,
    selectedAttributes,
  ]);

  // Get display price and stock
  const displayData = useMemo(() => {
    if (product.hasVariants) {
      if (selectedVariant) {
        return {
          price: selectedVariant.price,
          compareAtPrice: selectedVariant.compareAtPrice,
          stock: selectedVariant.stock,
          sku: selectedVariant.sku,
        };
      }

      // Show price range if no variant selected
      const prices = product.variants.map((v) => v.price);
      return {
        price: null,
        priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
        compareAtPrice: null,
        stock: 0,
        sku: null,
      };
    }

    // Simple product
    return {
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stock: product.stock,
      sku: null,
    };
  }, [product, selectedVariant]);

  const isOutOfStock = displayData.stock === 0;
  const hasDiscount =
    displayData.compareAtPrice &&
    displayData.compareAtPrice > (displayData.price || 0);

  const handleAddToCart = () => {
    if (product.hasVariants && !selectedVariant) {
      toast.error("Please select all options", {
        description:
          "Choose size, color, or other options before adding to cart",
      });
      return;
    }

    if (isOutOfStock) {
      toast.error("Out of stock", {
        description: "This product is currently unavailable",
      });
      return;
    }

    // Add to cart
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id || null,
      name: product.name,
      variantName: selectedVariant?.name || null,
      price: displayData.price!,
      slug: product.slug,
      image: product.images[0] || "",
      stock: displayData.stock,
      quantity,
    });

    toast.success("Added to cart!", {
      description: `${quantity}x ${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ""} added to your cart`,
    });
  };

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 container px-4 mx-auto">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}

            {isOutOfStock && (
              <Badge variant="destructive" className="absolute top-4 right-4">
                Out of Stock
              </Badge>
            )}

            {hasDiscount && !isOutOfStock && (
              <Badge className="absolute top-4 right-4 bg-red-500">Sale</Badge>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden border-2 transition-colors ${
                    selectedImage === index
                      ? "border-black"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category */}
          {product.category && (
            <Badge variant="outline">{product.category.name}</Badge>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            {displayData.price ? (
              <>
                <p className="text-3xl font-bold text-red-400">
                  GH₵ {displayData.price.toFixed(2)}
                </p>
                {hasDiscount && displayData.compareAtPrice && (
                  <p className="text-xl text-gray-500 line-through">
                    GH₵ {displayData.compareAtPrice.toFixed(2)}
                  </p>
                )}
              </>
            ) : displayData.priceRange ? (
              <p className="text-3xl font-bold">
                GH₵ {displayData.priceRange.min.toFixed(2)} - GH₵{" "}
                {displayData.priceRange.max.toFixed(2)}
              </p>
            ) : null}
          </div>

          {/* Variant Selectors */}
          {product.hasVariants && attributeNames.length > 0 && (
            <div className="space-y-4 py-4 border-y">
              <h3 className="font-semibold">Select Options:</h3>
              {attributeNames.map((attributeName) => (
                <div key={attributeName} className="space-y-2">
                  <Label htmlFor={attributeName}>{attributeName}</Label>
                  <Select
                    value={selectedAttributes[attributeName] || ""}
                    onValueChange={(value) =>
                      setSelectedAttributes({
                        ...selectedAttributes,
                        [attributeName]: value,
                      })
                    }
                  >
                    <SelectTrigger id={attributeName}>
                      <SelectValue
                        placeholder={`Select ${attributeName.toLowerCase()}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getAttributeOptions(attributeName).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              {selectedVariant && (
                <p className="text-sm text-gray-600">
                  {displayData.stock > 0
                    ? `${displayData.stock} in stock`
                    : "Out of stock"}
                </p>
              )}
            </div>
          )}

          {product.hasVariants && (
            <div className="text-sm text-gray-600">
              {(() => {
                const inStockCount = product.variants.filter(
                  (v) => v.stock > 0,
                ).length;
                const totalCount = product.variants.length;

                if (inStockCount === 0) {
                  return "**All variants currently out of stock";
                } else if (inStockCount === totalCount) {
                  return `*All ${totalCount} variants available`;
                } else {
                  return `${inStockCount} of ${totalCount} variants available`;
                }
              })()}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label>Quantity:</Label>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock}
                >
                  -
                </Button>
                <span className="px-4 py-2 min-w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={isOutOfStock || quantity >= displayData.stock}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={
                  isOutOfStock || (product.hasVariants && !selectedVariant)
                }
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* SKU */}
          {displayData.sku && (
            <p className="text-sm text-gray-500">SKU: {displayData.sku}</p>
          )}
        </div>
      </div>
    </div>
  );
}
