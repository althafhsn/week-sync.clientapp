"use client";

import { SearchIcon, XIcon } from "lucide-react";

import { DateRangeField } from "@/components/DateRangeField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterConfig {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

export interface DateRangeFilterConfig {
  startValue: string;
  endValue: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters,
  dateRange,
  onReset,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: FilterConfig[];
  dateRange?: DateRangeFilterConfig;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:min-w-[200px] sm:flex-1">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 pl-8"
        />
      </div>

      {/* Below sm: 2-column grid. At sm+, `contents` drops the grid so these
       * children flow directly into the parent's flex-wrap row. */}
      <div className="grid grid-cols-2 gap-2 sm:contents">
        {filters.map((filter) => (
          <Select
            key={filter.id}
            items={[
              { value: "all", label: `All ${filter.label}` },
              ...filter.options,
            ]}
            value={filter.value}
            onValueChange={(value) => filter.onChange(value as string)}
          >
            <SelectTrigger className="h-10 w-full sm:w-auto sm:min-w-[180px]">
              <SelectValue>
                {filter.value === "all"
                  ? `All ${filter.label}`
                  : (filter.options.find((o) => o.value === filter.value)?.label ??
                    `All ${filter.label}`)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {dateRange ? (
          <DateRangeField
            className="w-full sm:w-auto"
            startValue={dateRange.startValue}
            endValue={dateRange.endValue}
            onStartChange={dateRange.onStartChange}
            onEndChange={dateRange.onEndChange}
          />
        ) : null}

        <Button
          type="button"
          variant="outline"
          className="h-10 w-full sm:w-auto"
          onClick={onReset}
        >
          <XIcon className="size-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
