"use client";

import { useCart } from "@/lib/cart-context";
import { useMounted } from "@/lib/use-mounted";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export default function CartBadge() {
  const { itemCount } = useCart();
  const mounted = useMounted();

  return (
    <Link href="/cart">
      <Button size="sm" className="relative bg-black border border-black rounded-none hover:bg-transparent hover:text-black cursor-pointer">
        <ShoppingCart className="h-4 w-4" />
        Cart
        {mounted && itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Button>
    </Link>
  );
}