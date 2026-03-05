"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryFiltersForm from "@/components/admin/category-filters-form";

// Proper type definitions
type CategoryFilter = {
  id: string;
  name: string;
  options: string[];
  createdAt: Date;
  updatedAt: Date;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  filters: CategoryFilter[];
};

type FilterInput = {
  id?: string;
  name: string;
  options: string[];
};

export default function CategoryEditForm({ category }: { category: Category }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: category.name,
    slug: category.slug,
    description: category.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Category updated successfully!");
        router.push("/admin/categories");
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveFilters = async (filters: FilterInput[]) => {
    const response = await fetch(`/api/categories/${category.id}/filters`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filters }),
    });

    if (!response.ok) {
      throw new Error("Failed to save filters");
    }

    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Category"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Product Filters</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Add filters that customers can use to narrow down products in this
            category (e.g., Size, Color, Fragrance Type)
          </p>
        </CardHeader>
        <CardContent>
          <CategoryFiltersForm
            categoryId={category.id}
            initialFilters={category.filters}
            onSave={handleSaveFilters}
          />
        </CardContent>
      </Card>
    </div>
  );
}