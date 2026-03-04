"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-context";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
};

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      slug: product.slug,
      image: product.images[0],
      stock: product.stock,
    });

    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 500);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="font-medium">Quantity:</span>
        <div className="flex items-center border rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val > 0 && val <= product.stock) setQuantity(val);
            }}
            className="w-16 text-center border-0 focus-visible:ring-0"
            min="1"
            max={product.stock}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={increaseQuantity}
            disabled={quantity >= product.stock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-sm text-gray-600">
          {product.stock} available
        </span>
      </div>

      {/* Add to Cart Button */}
      <Button
        size="lg"
        className="w-full bg-black rounded-none"
        onClick={handleAddToCart}
        disabled={product.stock === 0 || isAdding}
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        {isAdding ? "Added!" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  );
}