"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryFiltersForm from "@/components/admin/category-filters-form";

type FilterInput = {
  name: string;
  options: string[];
};

export default function CategoryCreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
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
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setCategoryId(data.id);
        alert("Category created! Now add filters (optional).");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveFilters = async (filters: FilterInput[]) => {
    if (!categoryId) return;

    const response = await fetch(`/api/categories/${categoryId}/filters`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filters }),
    });

    if (!response.ok) {
      throw new Error("Failed to save filters");
    }

    alert("Filters saved successfully!");
    router.push("/admin/categories");
    router.refresh();
  };

  const handleSkipFilters = () => {
    router.push("/admin/categories");
    router.refresh();
  };

  // Step 1: Create basic category info
  if (!categoryId) {
    return (
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
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Perfume Oils"
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
                placeholder="e.g., perfume-oils"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Auto-generated from name, but you can customize it
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
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Category"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Add filters (optional)
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>✅ Category Created!</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Now add filters to help customers narrow down products (optional)
          </p>
        </CardHeader>
        <CardContent>
          <CategoryFiltersForm
            categoryId={categoryId}
            initialFilters={[]}
            onSave={handleSaveFilters}
          />

          <div className="mt-6 flex gap-2">
            <Button onClick={handleSkipFilters} variant="outline">
              Skip for Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}