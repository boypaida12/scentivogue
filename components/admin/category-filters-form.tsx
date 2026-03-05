"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
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

type CategoryFilter = {
  id?: string;
  name: string;
  options: string[];
};

type CategoryFiltersFormProps = {
  categoryId: string;
  initialFilters?: CategoryFilter[];
  onSave: (filters: CategoryFilter[]) => Promise<void>;
};

export default function CategoryFiltersForm({
  categoryId,
  initialFilters = [],
  onSave,
}: CategoryFiltersFormProps) {
  const [filters, setFilters] = useState<CategoryFilter[]>(initialFilters);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [validFilters, setValidFilters] = useState<CategoryFilter[]>([]);

  const addFilter = () => {
    setFilters([...filters, { name: "", options: [""] }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilterName = (index: number, name: string) => {
    const newFilters = [...filters];
    newFilters[index].name = name;
    setFilters(newFilters);
  };

  const addOption = (filterIndex: number) => {
    const newFilters = [...filters];
    newFilters[filterIndex].options.push("");
    setFilters(newFilters);
  };

  const removeOption = (filterIndex: number, optionIndex: number) => {
    const newFilters = [...filters];
    newFilters[filterIndex].options = newFilters[filterIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setFilters(newFilters);
  };

  const updateOption = (
    filterIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newFilters = [...filters];
    newFilters[filterIndex].options[optionIndex] = value;
    setFilters(newFilters);
  };

  const handleSaveClick = () => {
    // Filter out empty filters and options
    const valid = filters
      .filter((f) => f.name.trim() !== "")
      .map((f) => ({
        ...f,
        options: f.options.filter((opt) => opt.trim() !== ""),
      }))
      .filter((f) => f.options.length > 0);

    if (valid.length === 0) {
      toast.error("No filters to save", {
        description: "Please add at least one filter with options before saving.",
      });
      return;
    }

    setValidFilters(valid);
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmDialog(false);
    setIsSaving(true);
    
    try {
      await onSave(validFilters);
      toast.success("Filters saved successfully!", {
        description: `Saved ${validFilters.length} filter(s) to this category.`,
      });
    } catch (error) {
      console.error("Error saving filters:", error);
      toast.error("Failed to save filters", {
        description: "Please try again or contact support if the issue persists.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold">Category Filters</p>
          <Button type="button" variant="outline" size="sm" onClick={addFilter}>
            <Plus className="h-4 w-4 mr-2" />
            Add Filter
          </Button>
        </div>

        {filters.length === 0 && (
          <p className="text-sm text-gray-500">
            No filters yet. Add filters to help customers narrow down products in
            this category.
          </p>
        )}

        {filters.map((filter, filterIndex) => (
          <div key={filterIndex} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <Label>Filter Name</Label>
                <Input
                  value={filter.name}
                  onChange={(e) => updateFilterName(filterIndex, e.target.value)}
                  placeholder="e.g., Size, Fragrance Type, Color"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFilter(filterIndex)}
                className="mt-6"
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Options</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addOption(filterIndex)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-2">
                {filter.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) =>
                        updateOption(filterIndex, optionIndex, e.target.value)
                      }
                      placeholder="e.g., 30ml, Floral, Red"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(filterIndex, optionIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {filters.length > 0 && (
          <Button onClick={handleSaveClick} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Filters"}
          </Button>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Confirm Filter Names
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span>You are about to save the following filters:</span>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                {validFilters.map((filter, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-semibold text-red-600">{filter.name}</span>
                    <span className="text-gray-600 ml-4">
                      {filter.options.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
              
              <span className="text-sm font-medium text-orange-600">
                ⚠️ Please double-check the spelling of filter names (shown in red above).
              </span>
              <span className="text-sm">
                These names will be used when creating product variants. Typos here will cause issues later.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel & Edit</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>
              Looks Good, Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}