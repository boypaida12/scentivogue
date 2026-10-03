"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";
import { format } from "date-fns";

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
  isSaleActive: boolean;
  saleStartDate: Date | null;
  saleEndDate: Date | null;
  category: {
    id: string;
    name: string;
  } | null;
  variants: ProductVariant[];
};

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);

  // For multi-select bundles: Map<variantId, quantity>
  const [selectedVariants, setSelectedVariants] = useState<Map<string, number>>(
    new Map(),
  );

  // Toggle variant selection
  const toggleVariant = (variantId: string) => {
    const newSelected = new Map(selectedVariants);
    if (newSelected.has(variantId)) {
      newSelected.delete(variantId);
    } else {
      newSelected.set(variantId, 1);
    }
    setSelectedVariants(newSelected);
  };

  // Update quantity for a selected variant
  const updateVariantQuantity = (variantId: string, quantity: number) => {
    const newSelected = new Map(selectedVariants);
    if (quantity <= 0) {
      newSelected.delete(variantId);
    } else {
      newSelected.set(variantId, quantity);
    }
    setSelectedVariants(newSelected);
  };

  // Calculate bundle total
  const bundleTotal = useMemo(() => {
    let total = 0;
    selectedVariants.forEach((qty, variantId) => {
      const variant = product.variants.find((v) => v.id === variantId);
      if (variant) {
        total += variant.price * qty;
      }
    });
    return total;
  }, [selectedVariants, product.variants]);

  // Get selected variant details for preview
  const selectedVariantDetails = useMemo(() => {
    const details: Array<{ variant: ProductVariant; quantity: number }> = [];
    selectedVariants.forEach((qty, variantId) => {
      const variant = product.variants.find((v) => v.id === variantId);
      if (variant) {
        details.push({ variant, quantity: qty });
      }
    });
    return details.sort((a, b) => a.variant.name.localeCompare(b.variant.name));
  }, [selectedVariants, product.variants]);

  // Check if any variant is in stock
  const hasInStock = product.variants.some((v) => v.stock > 0);

  // Handle add to cart - adds multiple items at once
  const handleAddBundleToCart = () => {
    if (selectedVariants.size === 0) {
      toast.error("Please select variants", {
        description: "Select at least one variant to add to cart",
      });
      return;
    }

    // Add each selected variant to cart
    selectedVariants.forEach((quantity, variantId) => {
      const variant = product.variants.find((v) => v.id === variantId);
      if (variant && quantity > 0) {
        if (quantity > variant.stock) {
          toast.error(`Insufficient stock for ${variant.name}`);
          return;
        }

        addItem({
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          variantName: variant.name,
          price: variant.price,
          slug: product.slug,
          image: product.images[0] || "",
          stock: variant.stock,
          quantity,
        });
      }
    });

    toast.success("Bundle added to cart!", {
      description: `${selectedVariants.size} variant(s) added to your cart`,
    });

    setSelectedVariants(new Map());
  };

  // Check if sale is live
  const isSaleLive = useMemo(() => {
    if (!product.isSaleActive) return false;

    const now = new Date();
    const saleStarted =
      !product.saleStartDate || new Date(product.saleStartDate) <= now;
    const saleEnded =
      product.saleEndDate && new Date(product.saleEndDate) < now;

    return saleStarted && !saleEnded;
  }, [product.isSaleActive, product.saleStartDate, product.saleEndDate]);

  // Get days until sale
  const daysUntilSale = useMemo(() => {
    if (isSaleLive) return 0;
    if (!product.saleStartDate) return null;

    const now = new Date();
    const start = new Date(product.saleStartDate);
    const days = Math.ceil(
      (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return days > 0 ? days : 0;
  }, [isSaleLive, product.saleStartDate]);

  // Get formatted sale date
  const saleStartFormatted = product.saleStartDate
    ? format(new Date(product.saleStartDate), "PPP p")
    : null;

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

            {!hasInStock && (
              <Badge variant="destructive" className="absolute top-4 right-4">
                Out of Stock
              </Badge>
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

          {/* ✅ SALE STATUS BANNER */}
          {product.isSaleActive && !isSaleLive && daysUntilSale !== null && (
            <div className="p-4 border-2 border-[#FF8C00] rounded-lg bg-orange-50">
              <p className="font-semibold text-[#FF8C00]">
                🔄 Sale Coming Soon!
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {daysUntilSale === 0
                  ? "Sale starts today!"
                  : daysUntilSale === 1
                    ? "Sale starts tomorrow!"
                    : `Sale starts in ${daysUntilSale} days`}
              </p>
              <p className="text-xs text-gray-600 mt-2">{saleStartFormatted}</p>
            </div>
          )}

          {product.isSaleActive && isSaleLive && (
            <div className="p-4 border-2 border-red-500 rounded-lg bg-red-50">
              <p className="font-semibold text-red-600">🎉 SALE IS LIVE!</p>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          {/* Variants Section */}
          {product.hasVariants && product.variants.length > 0 && (
            <div className="space-y-4 py-4 border-y">
              <h3 className="font-semibold text-lg">
                Select Variants (Multi-Select):
              </h3>

              {/* Variants List */}
              <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariants.has(variant.id);
                  const quantity = selectedVariants.get(variant.id) || 0;
                  const hasDiscount =
                    variant.compareAtPrice &&
                    variant.compareAtPrice > variant.price;

                  return (
                    <div
                      key={variant.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                        isSelected
                          ? "bg-white border-[#FF8C00]"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleVariant(variant.id)}
                        className="w-5 h-5 rounded cursor-pointer accent-[#FF8C00]"
                        aria-label={`Select ${variant.name}`}
                      />

                      {/* Variant Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {variant.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-bold text-red-400">
                            GH₵ {variant.price.toFixed(2)}
                          </span>
                          {hasDiscount && variant.compareAtPrice && (
                            <span className="text-gray-500 line-through">
                              GH₵ {variant.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                          <span
                            className={`text-xs ${
                              variant.stock > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {variant.stock > 0
                              ? `${variant.stock} in stock`
                              : "Out of stock"}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Control */}
                      {isSelected && variant.stock > 0 && (
                        <div className="flex items-center border rounded-lg bg-white">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateVariantQuantity(
                                variant.id,
                                Math.max(0, quantity - 1),
                              )
                            }
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-3 py-1 min-w-8 text-center text-sm font-medium">
                            {quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateVariantQuantity(variant.id, quantity + 1)
                            }
                            disabled={quantity >= variant.stock}
                            className="h-8 w-8 p-0 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-sm text-gray-600">
                {product.variants.filter((v) => v.stock > 0).length} of{" "}
                {product.variants.length} variants available
              </p>
            </div>
          )}

          {/* Selected Bundle Preview */}
          {selectedVariantDetails.length > 0 && (
            <div className="space-y-3 p-4 border rounded-lg bg-blue-50">
              <h4 className="font-semibold text-gray-900">Selected Bundle:</h4>

              {/* Item List */}
              <div className="space-y-2">
                {selectedVariantDetails.map(({ variant, quantity }) => (
                  <div
                    key={variant.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-700">
                      {variant.name} x{quantity}
                    </span>
                    <span className="font-medium">
                      GH₵ {(variant.price * quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-900">
                  Bundle Total:
                </span>
                <span className="text-xl font-bold text-[#FF8C00]">
                  GH₵ {bundleTotal.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="w-full bg-[#FF8C00] hover:bg-[#E67E00] text-white rounded-none"
            onClick={handleAddBundleToCart}
            disabled={
              selectedVariants.size === 0 ||
              !hasInStock ||
              (product.isSaleActive && !isSaleLive)
            }
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.isSaleActive && !isSaleLive
              ? `Sale Starts ${daysUntilSale === 1 ? "Tomorrow" : `in ${daysUntilSale} days`}`
              : selectedVariants.size === 0
              ? "Select Variants to Add Bundle"
              : `Add Bundle (${selectedVariants.size}) to Cart`}
          </Button>
        </div>
      </div>
    </div>
  );
}
