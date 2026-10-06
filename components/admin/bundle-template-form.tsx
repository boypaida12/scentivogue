"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type TemplateItem = {
  id?: string;
  name: string;
  sku: string | null;
  stock: number;
};

type BundleTemplateFormProps = {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    items: TemplateItem[];
  };
};

export default function BundleTemplateForm({
  initialData,
}: BundleTemplateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
  });

  const [items, setItems] = useState<TemplateItem[]>(initialData?.items || []);

  const [newItemName, setNewItemName] = useState("");
  const [newItemSku, setNewItemSku] = useState("");
  const [newItemStock, setNewItemStock] = useState("");

  const addItem = () => {
    if (!newItemName.trim()) {
      toast.error("Please enter item name");
      return;
    }

    if (!newItemStock || parseInt(newItemStock) < 0) {
    toast.error("Please enter valid stock quantity");
    return;
  }

    const newItem: TemplateItem = {
      name: newItemName.trim(),
      sku: newItemSku.trim(),
      stock: parseInt(newItemStock),
    };

    setItems([...items, newItem]);
    setNewItemName("");
    setNewItemSku("");
    setNewItemStock("");
    toast.success("Item added");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    toast.success("Item removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter template name");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item to the template");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = initialData
        ? `/api/bundle-templates/${initialData.id}`
        : "/api/bundle-templates";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          items: items.map((item) => ({
            name: item.name,
            sku: item.sku || null,
            stock: item.stock,
          })),
        }),
      });

      if (response.ok) {
        toast.success(initialData ? "Template updated!" : "Template created!");
        router.push("/admin/bundle-templates");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save template");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save template",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/bundle-templates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {initialData ? "Edit Template" : "New Template"}
          </h1>
          <p className="text-gray-600 mt-1">
            {initialData
              ? "Update your bundle template"
              : "Create a reusable bundle template"}
          </p>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Luxury Fragrance Collection"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              A descriptive name for this template
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe what's included in this collection..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Template Items */}
      <Card>
        <CardHeader>
          <CardTitle>Template Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Item */}
          <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold text-sm">Add Item</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g., Rose Perfume"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") addItem();
                  }}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="itemSku">SKU (Optional)</Label>
                <Input
                  id="itemSku"
                  value={newItemSku}
                  onChange={(e) => setNewItemSku(e.target.value)}
                  placeholder="ROSE-001"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") addItem();
                  }}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="itemStock">Stock *</Label>
                <Input
                  id="itemStock"
                  type="number"
                  min="0"
                  value={newItemStock}
                  onChange={(e) => setNewItemStock(e.target.value)}
                  placeholder="10"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") addItem();
                  }}
                />
              </div>
            </div>

            <Button type="button" onClick={addItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Items ({items.length})</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        SKU: {item.sku || "N/A"} | Stock: {item.stock}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 ml-2 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {items.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No items added yet
            </p>
          )}
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
              ? "Update Template"
              : "Create Template"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/bundle-templates">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
