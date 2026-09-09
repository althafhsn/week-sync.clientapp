"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const DEFAULT_PAGE_SIZE_OPTIONS = ["5", "10", "25", "50", "all"];

function pageSizeLabel(value: string) {
  return value === "all" ? "All" : value;
}

export function PaginationControls({
  page,
  pageCount,
  onPageChange,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
  total,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Current page size as a string ("5", "10", ...) or "all". Pass together
   * with `onPageSizeChange` to show the rows-per-page selector. */
  pageSize?: string;
  pageSizeOptions?: string[];
  onPageSizeChange?: (pageSize: string) => void;
  /** Total row count across all pages. When provided, shown alongside "Page X of Y". */
  total?: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
      <div className="flex items-center gap-3">
        <p className="text-muted-foreground text-xs">
          Page {page} of {pageCount}
          {total != null ? ` · ${total} total` : ""}
        </p>
        {pageSize && onPageSizeChange ? (
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground text-xs">Rows per page</span>
            <Select
              items={pageSizeOptions.map((value) => ({
                value,
                label: pageSizeLabel(value),
              }))}
              value={pageSize}
              onValueChange={(value) => onPageSizeChange(value as string)}
            >
              <SelectTrigger className="h-8 w-auto min-w-16">
                <SelectValue>{pageSizeLabel(pageSize)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {pageSizeLabel(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
