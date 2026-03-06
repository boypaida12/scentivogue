"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, ExternalLink } from "lucide-react";
import CreateCategoryDialog from "./create-category-dialog";
import ImageUpload from "./image-upload";
import ProductVariantManager from "./product-variants-manager";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  slug: string;
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

type ProductFormProps = {
  categories: Category[];
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compareAtPrice: number | null;
    costPrice: number | null;
    sku: string | null;
    stock: number;
    images: string[];
    categoryId: string | null;
    isActive: boolean;
    isFeatured: boolean;
    hasVariants: boolean;
    variants?: Array<{
      id: string;
      name: string;
      attributes: Record<string, string>;
      price: number;
      compareAtPrice: number | null;
      costPrice: number | null;
      stock: number;
      sku: string | null;
    }>;
  };
};

export default function ProductForm({
  categories: initialCategories,
  initialData,
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState(initialCategories);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
    compareAtPrice: initialData?.compareAtPrice?.toString() || "",
    costPrice: initialData?.costPrice?.toString() || "",
    sku: initialData?.sku || "",
    stock: initialData?.stock?.toString() || "0",
    categoryId: initialData?.categoryId || "",
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured ?? false,
  });

  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [productType, setProductType] = useState<"simple" | "variant">(
    initialData?.hasVariants ? "variant" : "simple",
  );
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants?.map((v) => ({
      id: v.id,
      name: v.name,
      attributes: v.attributes || {},
      price: v.price.toString(),
      compareAtPrice: v.compareAtPrice?.toString() || "",
      costPrice: v.costPrice?.toString() || "",
      stock: v.stock.toString(),
      sku: v.sku || "",
    })) || [],
  );

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    });
  };

  const handleCategoryCreated = (category: Category) => {
    setCategories([...categories, category]);
    setFormData({ ...formData, categoryId: category.id });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate variants if product has variants
    if (productType === "variant") {
      if (variants.length === 0) {
        toast.error("Please add at least one variant for this product");
        return;
      }

      // Check each variant has price and stock
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const price = parseFloat(v.price);
        const stock = parseInt(v.stock, 10);

        if (!v.price || isNaN(price) || price <= 0) {
          toast.error(
            `Variant ${i + 1} (${v.name || "Unnamed"}): Please enter a valid price`,
          );
          return;
        }

        if (!v.stock || isNaN(stock) || stock < 0) {
          toast.error(
            `Variant ${i + 1} (${v.name || "Unnamed"}): Please enter a valid stock quantity`,
          );
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const url = initialData
        ? `/api/products/${initialData.id}`
        : "/api/products";
      const method = initialData ? "PUT" : "POST";

      const payload = {
        ...formData,
        images: images,
        hasVariants: productType === "variant",
        variants:
          productType === "variant"
            ? variants.map((v) => ({
                id: v.id,
                name: v.name,
                attributes: v.attributes,
                price: parseFloat(v.price),
                compareAtPrice: v.compareAtPrice
                  ? parseFloat(v.compareAtPrice)
                  : null,
                costPrice: v.costPrice ? parseFloat(v.costPrice) : null,
                stock: parseInt(v.stock, 10),
                sku: v.sku || null,
              }))
            : [],
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
    toast.success("Product succesfully added!")
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g., Chanel No. 5"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="chanel-no-5"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Automatically filled from product name. You can customize it if
                needed.
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Elegant floral perfume with timeless sophistication..."
                rows={4}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="category">Category</Label>
              <div className="flex items-center justify-between">
                <Select
                  value={formData.categoryId || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      categoryId: value === "none" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <CreateCategoryDialog
                    trigger={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        New Category
                      </Button>
                    }
                    onSuccess={handleCategoryCreated}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    asChild
                  >
                    <Link href="/admin/categories" target="_blank">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Manage
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={5}
            />
            <p className="text-sm text-gray-500 mt-2">
              The first image will be the main product image. You can upload up
              to 5 images.
            </p>
          </CardContent>
        </Card>

        {/* Product Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Product Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={productType}
              onValueChange={(value: "simple" | "variant") =>
                setProductType(value)
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="simple" id="simple" />
                <Label htmlFor="simple" className="font-normal cursor-pointer">
                  Simple Product - Single price and stock
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="variant" id="variant" />
                <Label htmlFor="variant" className="font-normal cursor-pointer">
                  Product with Variants - Multiple sizes, colors, etc.
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Simple Product: Pricing & Inventory */}
        {productType === "simple" && (
          <>
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="price">Selling Price (GH₵) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="45.00"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="compareAtPrice">
                      Compare At Price (GH₵)
                    </Label>
                    <Input
                      id="compareAtPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.compareAtPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          compareAtPrice: e.target.value,
                        })
                      }
                      placeholder="60.00"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Original price (for showing discounts)
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="costPrice">Cost Price (GH₵)</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.costPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, costPrice: e.target.value })
                      }
                      placeholder="30.00"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Your cost (for profit tracking)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      placeholder="CH5-50ML"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Your internal product code
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      placeholder="10"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Variant Product: Variant Manager */}
        {productType === "variant" && (
          <ProductVariantManager
            categoryId={formData.categoryId || null}
            variants={variants}
            onChange={setVariants}
          />
        )}

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked as boolean })
                }
              />
              <Label htmlFor="isActive" className="font-normal cursor-pointer">
                Active (visible in store)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFeatured: checked as boolean })
                }
              />
              <Label
                htmlFor="isFeatured"
                className="font-normal cursor-pointer"
              >
                Featured (show on homepage)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? initialData
                ? "Updating..."
                : "Creating..."
              : initialData
                ? "Update Product"
                : "Create Product"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}
