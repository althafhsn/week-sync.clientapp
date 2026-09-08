"use client";

import { SearchIcon, XIcon } from "lucide-react";

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
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 pl-8"
        />
      </div>

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
          <SelectTrigger className="h-10 w-auto min-w-[180px]">
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
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateRange.startValue}
            onChange={(event) => dateRange.onStartChange(event.target.value)}
            max={dateRange.endValue || undefined}
            aria-label="Start date"
            className="h-10 w-auto"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="date"
            value={dateRange.endValue}
            onChange={(event) => dateRange.onEndChange(event.target.value)}
            min={dateRange.startValue || undefined}
            aria-label="End date"
            className="h-10 w-auto"
          />
        </div>
      ) : null}

      <Button type="button" variant="outline" className="h-10" onClick={onReset}>
        <XIcon className="size-4" />
        Clear
      </Button>
    </div>
  );
}
