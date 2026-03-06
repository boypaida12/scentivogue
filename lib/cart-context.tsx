"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type CartItem = {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  price: number;
  quantity: number;
  slug: string;
  image: string;
  stock: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize state with localStorage data
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("cart");
        if (!savedCart) return [];

        const parsed: unknown = JSON.parse(savedCart);

        // Type guard to ensure it's an array
        if (!Array.isArray(parsed)) {
          console.warn("Invalid cart data in localStorage, resetting cart");
          return [];
        }

        // Migrate old cart format to new format with proper type checking
        return parsed
          .map((item: unknown) => {
            // Type guard for each item
            if (typeof item !== "object" || item === null) {
              return null;
            }

            const cartItem = item as Record<string, unknown>;

            return {
              id: typeof cartItem.id === "string" ? cartItem.id : "",
              productId:
                typeof cartItem.productId === "string"
                  ? cartItem.productId
                  : typeof cartItem.id === "string"
                    ? cartItem.id
                    : "",
              variantId:
                typeof cartItem.variantId === "string"
                  ? cartItem.variantId
                  : null,
              name: typeof cartItem.name === "string" ? cartItem.name : "",
              variantName:
                typeof cartItem.variantName === "string"
                  ? cartItem.variantName
                  : null,
              price: typeof cartItem.price === "number" ? cartItem.price : 0,
              quantity:
                typeof cartItem.quantity === "number" ? cartItem.quantity : 1,
              slug: typeof cartItem.slug === "string" ? cartItem.slug : "",
              image: typeof cartItem.image === "string" ? cartItem.image : "",
              stock: typeof cartItem.stock === "number" ? cartItem.stock : 999,
            };
          })
          .filter((item): item is CartItem => item !== null && item.id !== "");
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        return [];
      }
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("cart", JSON.stringify(items));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [items]);

  const addItem = (newItem: Omit<CartItem, "id">) => {
    setItems((currentItems) => {
      // Create unique ID: use variantId if exists, otherwise productId
      const itemId = newItem.variantId || newItem.productId;

      // Check if item already exists in cart
      const existingItemIndex = currentItems.findIndex(
        (item) => item.id === itemId
      );

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const updatedItems = [...currentItems];
        const existingItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: Math.min(
            existingItem.quantity + newItem.quantity,
            newItem.stock
          ),
        };
        return updatedItems;
      }

      // Add new item with generated id
      return [...currentItems, { ...newItem, id: itemId }];
    });
  };

  const removeItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}