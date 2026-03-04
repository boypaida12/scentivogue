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
import { Plus, ExternalLink } from "lucide-react";
import CreateCategoryDialog from "./create-category-dialog";
import ImageUpload from "./image-upload";

type Category = {
  id: string;
  name: string;
  slug: string;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = initialData
        ? `/api/products/${initialData.id}`
        : "/api/products";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          images: images,
        }),
      });

      if (response.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
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
            <div className=" space-y-1">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g., Boys Cotton T-Shirt - Blue"
                required
              />
            </div>

            <div className=" space-y-1">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="boys-cotton-tshirt-blue"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Automatically filled from product name. You can customize it if
                needed.
              </p>
            </div>

            <div className=" space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Comfortable cotton t-shirt for boys aged 4-6 years..."
                rows={4}
              />
            </div>

            <div className=" space-y-1">
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
                    onSuccess={(category) => {
                      // Add to categories list and select it
                      setCategories([...categories, category]);
                      setFormData({ ...formData, categoryId: category.id });
                    }}
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

        {/* Image Upload */}

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

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className=" space-y-1">
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

              <div className=" space-y-1">
                <Label htmlFor="compareAtPrice">Compare At Price (GH₵)</Label>
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

              <div className=" space-y-1">
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
              <div className=" space-y-1">
                <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  placeholder="KTS-2024-BL"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Your internal product code
                </p>
              </div>

              <div className=" space-y-1">
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
