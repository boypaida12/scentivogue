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

// ✅ NEW: Type for bundle items
type BundleItem = {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  attributes: Record<string, string>;
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
  // ✅ NEW: Bundle fields
  productType?: string;
  bundleItemsPerSet?: number | null;
  bundlePrice?: number | null;
  bundleCompareAtPrice?: number | null;
  bundleCostPrice?: number | null;
  bundleItems?: BundleItem[];
  // Sale fields
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
  const [quantity, setQuantity] = useState(1);

  // ✅ NEW: For bundle multi-select: Set<bundleItemId>
  const [selectedBundleItems, setSelectedBundleItems] = useState<Set<string>>(
    new Set(),
  );

  // For variant single-select
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );

  const isBundle = product.productType === "bundle";
  const isVariant = product.hasVariants && product.variants.length > 0;
  const isSimple = !isBundle && !isVariant;

  // ✅ NEW: Toggle bundle item selection
  const toggleBundleItem = (itemId: string) => {
    const newSelected = new Set(selectedBundleItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedBundleItems(newSelected);
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

  const saleStartFormatted = product.saleStartDate
    ? format(new Date(product.saleStartDate), "PPP p")
    : null;

  // ✅ NEW: Get current price based on product type
  const currentPrice = isBundle ? product.bundlePrice : 
                       isVariant && selectedVariantId ? 
                         product.variants.find(v => v.id === selectedVariantId)?.price : 
                         product.price;

  const hasInStock = isBundle ? 
    (product.bundleItems?.some(item => item.stock > 0) ?? false) :
    isVariant ? 
      product.variants.some(v => v.stock > 0) :
      product.stock > 0;

  // ✅ NEW: Handle Add Bundle to Cart
  const handleAddBundleToCart = () => {
    if (selectedBundleItems.size !== product.bundleItemsPerSet) {
      toast.error("Invalid selection", {
        description: `Please select exactly ${product.bundleItemsPerSet} items`,
      });
      return;
    }

    if (quantity <= 0) {
      toast.error("Invalid quantity");
      return;
    }

    // Add bundle to cart with selected items
    addItem({
      productId: product.id,
      variantId: null,
      name: product.name,
      variantName: `Bundle (${product.bundleItemsPerSet} items)`,
      price: product.bundlePrice || 0,
      quantity,
      slug: product.slug,
      image: product.images[0] || "",
      stock: 999, // Bundles don't have stock limit in the traditional sense
      bundleItemsSelected: Array.from(selectedBundleItems), // ✅ Store selected item IDs
    });

    toast.success("Bundle added to cart!", {
      description: `${quantity} bundle(s) with ${product.bundleItemsPerSet} item(s) each`,
    });

    setSelectedBundleItems(new Set());
    setQuantity(1);
  };

  // Handle Add Variant to Cart
  const handleAddVariantToCart = () => {
    if (!selectedVariantId) {
      toast.error("Please select a variant");
      return;
    }

    const variant = product.variants.find(v => v.id === selectedVariantId);
    if (!variant) return;

    if (quantity > variant.stock) {
      toast.error("Insufficient stock");
      return;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariantId,
      name: product.name,
      variantName: variant.name,
      price: variant.price,
      quantity,
      slug: product.slug,
      image: product.images[0] || "",
      stock: variant.stock,
    });

    toast.success("Added to cart!", {
      description: `${quantity} × ${variant.name}`,
    });

    setSelectedVariantId(null);
    setQuantity(1);
  };

  // Handle Add Simple Product to Cart
  const handleAddSimpleToCart = () => {
    if (quantity > product.stock) {
      toast.error("Insufficient stock");
      return;
    }

    addItem({
      productId: product.id,
      variantId: null,
      name: product.name,
      variantName: null,
      price: product.price,
      quantity,
      slug: product.slug,
      image: product.images[0] || "",
      stock: product.stock,
    });

    toast.success("Added to cart!", {
      description: `${quantity} × ${product.name}`,
    });

    setQuantity(1);
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

          {/* Description */}
          {product.description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

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

          {/* SIMPLE PRODUCT */}
          {isSimple && (
            <>
              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-[#FF8C00]">
                    GH₵ {product.price.toFixed(2)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-lg text-gray-400 line-through">
                      GH₵ {product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-gray-700">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setQuantity(Math.min(quantity + 1, product.stock))
                    }
                    disabled={quantity >= product.stock}
                    className="h-10 w-10 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                size="lg"
                className="w-full bg-[#FF8C00] hover:bg-[#E67E00] text-white rounded-none"
                onClick={handleAddSimpleToCart}
                disabled={!hasInStock || (product.isSaleActive && !isSaleLive)}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.isSaleActive && !isSaleLive
                  ? `Sale Starts ${daysUntilSale === 1 ? "Tomorrow" : `in ${daysUntilSale} days`}`
                  : "Add to Cart"}
              </Button>
            </>
          )}

          {/* VARIANT PRODUCT */}
          {isVariant && (
            <>
              {/* Variant Selector */}
              <div className="space-y-4 py-4 border-y">
                <h3 className="font-semibold text-lg">Select a Variant:</h3>

                <div className="space-y-2">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariantId === variant.id;
                    const hasDiscount =
                      variant.compareAtPrice &&
                      variant.compareAtPrice > variant.price;

                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${
                          isSelected
                            ? "border-[#FF8C00] bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        } ${variant.stock === 0 ? "opacity-50" : ""}`}
                        disabled={variant.stock === 0}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{variant.name}</p>
                            <p className="text-sm text-gray-600">
                              {variant.stock > 0
                                ? `${variant.stock} in stock`
                                : "Out of stock"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#FF8C00]">
                              GH₵ {variant.price.toFixed(2)}
                            </p>
                            {hasDiscount && (
                              <p className="text-sm text-gray-400 line-through">
                                GH₵ {variant.compareAtPrice?.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              {selectedVariantId && (
                <div className="flex items-center gap-4">
                  <span className="text-gray-700">Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 min-w-12 text-center font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const variant = product.variants.find(
                          v => v.id === selectedVariantId
                        );
                        setQuantity(
                          Math.min(quantity + 1, variant?.stock || 1)
                        );
                      }}
                      className="h-10 w-10 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <Button
                size="lg"
                className="w-full bg-[#FF8C00] hover:bg-[#E67E00] text-white rounded-none"
                onClick={handleAddVariantToCart}
                disabled={
                  !selectedVariantId ||
                  !hasInStock ||
                  (product.isSaleActive && !isSaleLive)
                }
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.isSaleActive && !isSaleLive
                  ? `Sale Starts ${daysUntilSale === 1 ? "Tomorrow" : `in ${daysUntilSale} days`}`
                  : selectedVariantId
                  ? "Add to Cart"
                  : "Select a Variant"}
              </Button>
            </>
          )}

          {/* ✅ NEW: BUNDLE PRODUCT */}
          {isBundle && product.bundleItems && (
            <>
              {/* Bundle Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold text-blue-900">
                  Select {product.bundleItemsPerSet} Items for GH₵{" "}
                  {product.bundlePrice?.toFixed(2)}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  You&apos;ve selected {selectedBundleItems.size} of{" "}
                  {product.bundleItemsPerSet} items
                </p>
                {product.bundleCompareAtPrice &&
                  product.bundleCompareAtPrice > (product.bundlePrice || 0) && (
                    <p className="text-sm text-blue-600 mt-1">
                      <span className="line-through">
                        GH₵ {product.bundleCompareAtPrice.toFixed(2)}
                      </span>{" "}
                      - Save GH₵{" "}
                      {(
                        product.bundleCompareAtPrice -
                        (product.bundlePrice || 0)
                      ).toFixed(2)}
                    </p>
                  )}
              </div>

              {/* Bundle Items Selector */}
              <div className="space-y-3 py-4 border-y">
                <h3 className="font-semibold text-lg">Available Items:</h3>

                <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                  {product.bundleItems.map((item) => {
                    const isSelected = selectedBundleItems.has(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                          isSelected
                            ? "bg-white border-[#FF8C00]"
                            : "bg-white border-gray-200"
                        } ${item.stock === 0 ? "opacity-50" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleBundleItem(item.id)}
                          disabled={item.stock === 0}
                          className="w-5 h-5 rounded cursor-pointer accent-[#FF8C00]"
                          aria-label={`Select ${item.name}`}
                        />

                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p
                            className={`text-sm ${
                              item.stock > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {item.stock > 0
                              ? `${item.stock} available`
                              : "Out of stock"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Selection Progress:</span>
                  <span className="font-medium">
                    {selectedBundleItems.size}/{product.bundleItemsPerSet}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#FF8C00] h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        (selectedBundleItems.size /
                          (product.bundleItemsPerSet || 1)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Quantity for Sets */}
              {selectedBundleItems.size === product.bundleItemsPerSet && (
                <div className="flex items-center gap-4">
                  <span className="text-gray-700">Number of Sets:</span>
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 min-w-12 text-center font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-10 w-10 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Bundle Price Display */}
              {selectedBundleItems.size === product.bundleItemsPerSet && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">
                      Total Price:
                    </span>
                    <span className="text-2xl font-bold text-[#FF8C00]">
                      GH₵{" "}
                      {(
                        (product.bundlePrice || 0) * quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Add Bundle to Cart Button */}
              <Button
                size="lg"
                className="w-full bg-[#FF8C00] hover:bg-[#E67E00] text-white rounded-none"
                onClick={handleAddBundleToCart}
                disabled={
                  selectedBundleItems.size !== product.bundleItemsPerSet ||
                  (product.isSaleActive && !isSaleLive)
                }
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.isSaleActive && !isSaleLive
                  ? `Sale Starts ${daysUntilSale === 1 ? "Tomorrow" : `in ${daysUntilSale} days`}`
                  : selectedBundleItems.size === product.bundleItemsPerSet
                  ? `Add Bundle (${quantity}) to Cart`
                  : `Select ${product.bundleItemsPerSet} Items`}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}