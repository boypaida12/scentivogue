"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import BundleTemplateLoader from "./bundle-template-loader";

type BundleItem = {
  id?: string;
  name: string;
  sku: string;
  stock: string;
  attributes: Record<string, string>;
};

type Props = {
  items: BundleItem[];
  onChange: (items: BundleItem[]) => void;
};

export default function BundleItemsManager({ items, onChange }: Props) {
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

    const newItem: BundleItem = {
      name: newItemName.trim(),
      sku: newItemSku.trim(),
      stock: newItemStock,
      attributes: {},
    };

    onChange([...items, newItem]);

    setNewItemName("");
    setNewItemSku("");
    setNewItemStock("");
    toast.success("Item added to bundle");
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
    toast.success("Item removed");
  };

  // ✅ NEW: Handle template loading
  const handleLoadTemplate = (templateItems: BundleItem[]) => {
    onChange(templateItems);
  };

  return (
    <div className="space-y-4">
      {/* ✅ NEW: Template Loader */}
      <BundleTemplateLoader
        currentItems={items}
        onLoadTemplate={handleLoadTemplate}
      />

      <Card>
        <CardHeader>
          <CardTitle>Bundle Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Item */}
          <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold text-sm">Add Item Manually</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                <Label htmlFor="itemSku">SKU</Label>
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
              <h4 className="font-semibold text-sm">
                Items in Bundle ({items.length})
              </h4>
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
                      variant="ghost"
                      type="button"
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
              No items added yet. Load from template above or add items manually.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}