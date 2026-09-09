"use client";

import { SearchIcon, SparklesIcon, XIcon } from "lucide-react";

import { DateRangeField } from "@/components/DateRangeField";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  aiActive = false,
  onAiSearch,
  onExitAiMode,
  searchPlaceholder = "Search…",
  filters,
  dateRange,
  onReset,
}: {
  search: string;
  /** Every keystroke reaches this - while not in AI mode, the search box
   * filters live, the same as it always has, with no AI involved. */
  onSearchChange: (value: string) => void;
  /** Whether the bar is currently running in AI mode. Always shown as
   * clickable, regardless of whether there's text typed yet. */
  aiActive?: boolean;
  /** Runs the current search text through AI search and switches the bar
   * into AI mode. Triggered by the sparkle button (when not already active)
   * or by pressing Enter. Omit to hide the AI button entirely. */
  onAiSearch?: () => void;
  /** Switches back to plain live filtering. Triggered by clicking the
   * sparkle button again while already in AI mode. */
  onExitAiMode?: () => void;
  searchPlaceholder?: string;
  filters: FilterConfig[];
  dateRange?: DateRangeFilterConfig;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="w-full sm:min-w-[200px] sm:flex-1">
        <InputGroup className="h-10">
          <InputGroupAddon align="inline-start">
            <SearchIcon className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onAiSearch?.();
            }}
            placeholder={searchPlaceholder}
          />
          {onAiSearch ? (
            <InputGroupAddon align="inline-end">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <InputGroupButton
                      type="button"
                      size="icon-sm"
                      variant={aiActive ? "secondary" : "ghost"}
                      onClick={() => (aiActive ? onExitAiMode?.() : onAiSearch())}
                      aria-label={aiActive ? "Exit AI search" : "Search with AI"}
                      aria-pressed={aiActive}
                      className={aiActive ? "text-primary" : undefined}
                    />
                  }
                >
                  <SparklesIcon className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  {aiActive ? "AI search is on — click to turn off" : "Search with AI"}
                </TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
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
