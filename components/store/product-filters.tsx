"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FilterOption = {
  name: string;
  count: number;
};

type Filter = {
  name: string;
  options: FilterOption[];
};

type ProductFiltersProps = {
  filters: Filter[];
};

export default function ProductFilters({ filters }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Compute initial filters from URL (no useState needed)
  const selectedFilters = useMemo(() => {
    const filtersFromUrl: Record<string, string[]> = {};
    filters.forEach((filter) => {
      const param = searchParams.get(filter.name);
      if (param) {
        filtersFromUrl[filter.name] = param.split(",");
      }
    });
    return filtersFromUrl;
  }, [searchParams, filters]);

  const updateURL = (newFilters: Record<string, string[]>) => {
    const params = new URLSearchParams(searchParams);

    // Remove all filter params
    filters.forEach((filter) => {
      params.delete(filter.name);
    });

    // Add selected filters
    Object.entries(newFilters).forEach(([filterName, values]) => {
      if (values.length > 0) {
        params.set(filterName, values.join(","));
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleFilter = (filterName: string, value: string) => {
    const current = selectedFilters[filterName] || [];
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    const updated = {
      ...selectedFilters,
      [filterName]: newValues,
    };

    // Remove empty arrays
    if (newValues.length === 0) {
      delete updated[filterName];
    }

    updateURL(updated);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters = Object.keys(selectedFilters).length > 0;

  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-sm"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={filters.map((f) => f.name)}>
        {filters.map((filter) => (
          <AccordionItem key={filter.name} value={filter.name}>
            <AccordionTrigger className="text-sm font-medium">
              {filter.name}
              {selectedFilters[filter.name]?.length > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  ({selectedFilters[filter.name].length})
                </span>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {filter.options.map((option) => {
                  const isChecked = selectedFilters[filter.name]?.includes(
                    option.name,
                  );

                  return (
                    <div
                      key={option.name}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`${filter.name}-${option.name}`}
                        checked={isChecked}
                        onCheckedChange={() =>
                          toggleFilter(filter.name, option.name)
                        }
                      />
                      <Label
                        htmlFor={`${filter.name}-${option.name}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {option.name}
                        <span className="text-gray-500 ml-1">
                          ({option.count})
                        </span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
