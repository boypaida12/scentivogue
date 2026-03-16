"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import React from "react";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  hasVariants: boolean;
  category: {
    id: string;
    name: string;
  } | null;
  variants?: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
  }>;
};

export default function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set(),
  );

  const toggleExpanded = (productId: string) => {
    setExpandedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${deleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
        setDeleteId(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper function to get display data
  const getDisplayData = (product: Product) => {
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

      return {
        priceDisplay:
          minPrice === maxPrice
            ? `GH₵ ${minPrice.toFixed(2)}`
            : `GH₵ ${minPrice.toFixed(2)} - GH₵ ${maxPrice.toFixed(2)}`,
        stockDisplay: totalStock,
        variantCount: product.variants.length,
      };
    }

    return {
      priceDisplay: `GH₵ ${product.price.toFixed(2)}`,
      stockDisplay: product.stock,
      variantCount: 0,
    };
  };

  return (
    <div>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const displayData = getDisplayData(product);
              const isExpanded = expandedProducts.has(product.id);
              const hasVariants =
                product.hasVariants &&
                product.variants &&
                product.variants.length > 0;

              return (
                <React.Fragment key={product.id}>
                  <TableRow>
                    <TableCell>
                      {hasVariants && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(product.id)}
                          className="h-8 w-8 p-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {hasVariants && (
                          <p className="text-sm text-gray-500">
                            {displayData.variantCount} variant
                            {displayData.variantCount > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.category ? (
                        <Badge variant="outline">{product.category.name}</Badge>
                      ) : (
                        <span className="text-gray-400">No category</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {displayData.priceDisplay}
                    </TableCell>
                    <TableCell>
                      {displayData.stockDisplay === 0 ? (
                        <Badge variant="destructive">Out of stock</Badge>
                      ) : (
                        <span className="font-medium">
                          {displayData.stockDisplay}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {product.isActive ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                        {product.isFeatured && (
                          <Badge variant="outline">Featured</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(product.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Variant Rows (Expanded) */}
                  {isExpanded &&
                    hasVariants &&
                    product.variants!.map((variant) => (
                      <TableRow
                        key={variant.id}
                        className="bg-gray-50 hover:bg-gray-100"
                      >
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell className="pl-8">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">└</span>
                            <span className="text-sm text-gray-700">
                              {variant.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">Variant</span>
                        </TableCell>
                        <TableCell className="font-medium">
                          GH₵ {variant.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {variant.stock === 0 ? (
                            <Badge variant="destructive" className="text-xs">
                              Out
                            </Badge>
                          ) : variant.stock < 5 ? (
                            <span className="text-orange-600 font-medium text-sm">
                              {variant.stock}
                            </span>
                          ) : (
                            <span className="font-medium text-sm">
                              {variant.stock}
                            </span>
                          )}
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product and all its variants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
