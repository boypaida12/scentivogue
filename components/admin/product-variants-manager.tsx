"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

// Type definitions
type CategoryFilter = {
  id: string;
  name: string;
  options: string[];
};

type ProductVariant = {
  id?: string;
  name: string;
  attributes: Record<string, string>;
  price: string;
  compareAtPrice: string;
  costPrice: string;
  stock: string;
  sku: string;
};

type ProductVariantManagerProps = {
  categoryId: string | null;
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
};

export default function ProductVariantManager({
  categoryId,
  variants,
  onChange,
}: ProductVariantManagerProps) {
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilter[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  // Fetch category filters when category changes
  useEffect(() => {
    if (!categoryId) {
      return;
    }

    let isCancelled = false;

    const fetchCategoryFilters = async () => {
      if (!isCancelled) {
        setIsLoadingFilters(true);
      }

      try {
        const res = await fetch(`/api/categories/${categoryId}`);
        const data = await res.json();

        if (!isCancelled) {
          setCategoryFilters(data.filters || []);
        }
      } catch (error) {
        console.error("Error fetching category filters:", error);
        if (!isCancelled) {
          setCategoryFilters([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingFilters(false);
        }
      }
    };

    fetchCategoryFilters();

    return () => {
      isCancelled = true;
    };
  }, [categoryId]);

  const addVariant = () => {
    const newVariant: ProductVariant = {
      name: `Variant ${variants.length + 1}`,
      attributes: {},
      price: "",
      compareAtPrice: "",
      costPrice: "",
      stock: "0",
      sku: "",
    };
    onChange([...variants, newVariant]);
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const updateVariantAttribute = (
    index: number,
    filterName: string,
    value: string,
  ) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      attributes: {
        ...updatedVariants[index].attributes,
        [filterName]: value,
      },
    };

    // Auto-generate variant name from all attributes
    const variant = updatedVariants[index];
    const nameParts = Object.values(variant.attributes).filter(
      (val) => val !== "",
    );

    updatedVariants[index].name =
      nameParts.length > 0 ? nameParts.join(" - ") : `Variant ${index + 1}`;

    onChange(updatedVariants);
  };

  const updateVariantField = (
    index: number,
    field: keyof Omit<ProductVariant, "attributes">,
    value: string,
  ) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value,
    };
    onChange(updatedVariants);
  };

  if (!categoryId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Select a category first to enable variants
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingFilters) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading category filters...</p>
        </CardContent>
      </Card>
    );
  }

  if (categoryFilters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            This category has no filters defined. Products in this category will
            use simple pricing (no variants).
          </p>
          <p className="text-sm text-gray-500 mt-2">
            To add variants, first add filters to the category.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Variants</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Create multiple variants with different attributes, prices, and stock
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {variants.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-sm text-gray-500 mb-4">
              No variants yet. Add variants if this product comes in different
              sizes, colors, or other options.
            </p>
            <Button type="button" onClick={addVariant}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Variant
            </Button>
          </div>
        ) : (
          <>
            {variants.map((variant, index) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        Variant {index + 1}: {variant.name || "Unnamed"}
                      </CardTitle>
                      {!variant.name && (
                        <p className="text-sm text-gray-500 mt-1">
                          Name will be auto-generated from selected attributes
                          (e.g., &quot;30ml - Floral&quot;)
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariant(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Dynamic filter fields - ALL filters rendered */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryFilters.map((filter) => (
                      <div key={filter.id} className="space-y-1">
                        <Label htmlFor={`${filter.name}-${index}`}>
                          {filter.name}
                        </Label>
                        <Select
                          value={variant.attributes[filter.name] || ""}
                          onValueChange={(value) =>
                            updateVariantAttribute(index, filter.name, value)
                          }
                        >
                          <SelectTrigger id={`${filter.name}-${index}`}>
                            <SelectValue
                              placeholder={`Select ${filter.name.toLowerCase()}`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {filter.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor={`price-${index}`}>Price (GH₵) *</Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariantField(index, "price", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`compareAtPrice-${index}`}>
                        Compare at Price (GH₵)
                      </Label>
                      <Input
                        id={`compareAtPrice-${index}`}
                        type="number"
                        step="0.01"
                        value={variant.compareAtPrice}
                        onChange={(e) =>
                          updateVariantField(
                            index,
                            "compareAtPrice",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`costPrice-${index}`}>
                        Cost Price (GH₵)
                      </Label>
                      <Input
                        id={`costPrice-${index}`}
                        type="number"
                        step="0.01"
                        value={variant.costPrice}
                        onChange={(e) =>
                          updateVariantField(index, "costPrice", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Stock & SKU */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor={`stock-${index}`}>Stock Quantity *</Label>
                      <Input
                        id={`stock-${index}`}
                        type="number"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariantField(index, "stock", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`sku-${index}`}>SKU</Label>
                      <Input
                        id={`sku-${index}`}
                        type="text"
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariantField(index, "sku", e.target.value)
                        }
                        placeholder="e.g., CH5-50ML-FL"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button type="button" onClick={addVariant} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Variant
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
