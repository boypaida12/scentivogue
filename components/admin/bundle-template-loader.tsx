"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Copy } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type BundleItem = {
  id?: string;
  name: string;
  sku: string;
  stock: string;
  attributes: Record<string, string>;
};

type BundleTemplate = {
  id: string;
  name: string;
  description: string | null;
  items: Array<{
    id: string;
    name: string;
    sku: string | null;
    stock: string;
  }>;
};

type Props = {
  currentItems: BundleItem[];
  onLoadTemplate: (items: BundleItem[]) => void;
};

export default function BundleTemplateLoader({
  currentItems,
  onLoadTemplate,
}: Props) {
  const [templates, setTemplates] = useState<BundleTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/bundle-templates");
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        } else {
          console.error("Failed to fetch templates");
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleLoadTemplate = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    const template = templates.find((t) => t.id === selectedTemplate);
    if (!template) {
      toast.error("Template not found");
      return;
    }

    // Convert template items to bundle items (with empty stock)
    const items: BundleItem[] = template.items.map((item) => ({
      name: item.name,
      sku: item.sku || "",
      stock: item.stock.toString(),
      attributes: {},
    }));

    onLoadTemplate(items);
    setSelectedTemplate("");
    toast.success(`Loaded ${items.length} items from template`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500">Loading templates...</p>
        </CardContent>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-900 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            No Templates Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-800 mb-4">
            Create bundle templates to quickly populate items across multiple
            products.
          </p>
          <Button asChild size="sm">
            <Link href="/admin/bundle-templates/new">Create First Template</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Load from Template</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Quickly populate bundle items from a saved template. You can edit or
          remove items after loading.
        </p>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="template-select">Select Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-xs text-gray-500">
                        {template.items.length} items
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              {(() => {
                const template = templates.find((t) => t.id === selectedTemplate);
                return (
                  <>
                    <p className="font-medium text-sm text-blue-900">
                      {template?.name}
                    </p>
                    {template?.description && (
                      <p className="text-xs text-blue-700 mt-1">
                        {template.description}
                      </p>
                    )}
                    <p className="text-xs text-blue-600 mt-2">
                      {template?.items.length} items to load
                    </p>
                  </>
                );
              })()}
            </div>
          )}

          <Button
            onClick={handleLoadTemplate}
            disabled={!selectedTemplate}
            className="w-full"
            variant="secondary"
          >
            <Copy className="h-4 w-4 mr-2" />
            Load Template Items
          </Button>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-gray-500">
            💡 <strong>Tip:</strong> You can manage templates in{" "}
            <Link
              href="/admin/bundle-templates"
              className="text-blue-600 hover:underline"
            >
              Bundle Templates
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}