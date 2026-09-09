"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDateLabel, parseLocalDate, toIsoDate } from "@/lib/date";

export function DateRangeField({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  className,
}: {
  startValue: string;
  endValue: string;
  onStartChange: (iso: string) => void;
  onEndChange: (iso: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const from = parseLocalDate(startValue);
  const to = parseLocalDate(endValue);

  // Only the committed (both-ends-picked) range is shown and pushed to the
  // caller — a lone first click starts a draft selection here but doesn't
  // fire onStartChange/onEndChange yet, so it can't trigger a filter/API
  // call until the range is actually complete.
  const [draft, setDraft] = useState<DateRange | undefined>({ from, to });

  const label = from
    ? to
      ? `${formatDateLabel(from, from.getFullYear() !== to.getFullYear())} to ${formatDateLabel(to, true)}`
      : `${formatDateLabel(from, true)} to …`
    : "Select date range";

  function handleOpenChange(next: boolean) {
    if (next) {
      // Reopening starts a fresh draft from whatever range is committed.
      setDraft({ from, to });
    }
    setOpen(next);
  }

  function handleSelect(range: DateRange | undefined) {
    setDraft(range);
    if (range?.from && range?.to) {
      onStartChange(toIsoDate(range.from));
      onEndChange(toIsoDate(range.to));
      setOpen(false);
    }
  }

  function handleClear() {
    setDraft(undefined);
    onStartChange("");
    onEndChange("");
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-10 w-auto justify-start gap-2 font-normal",
              !from && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="size-4 shrink-0" />
        {/* Same width as the sibling filter pills even when the picked
         * label is too long to fit — it scrolls inside the pill instead of
         * stretching or clipping it. */}
        <span className="min-w-0 flex-1 overflow-x-auto text-left whitespace-nowrap scrollbar-none [-ms-overflow-style:none]">
          {label}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={draft}
          defaultMonth={draft?.from ?? from}
          numberOfMonths={1}
          // Without a minimum span, the first click alone already produces
          // a complete { from, to } pair for that single day (react-day-picker's
          // addToRange sets to = from when min is 0) — that's what closed the
          // popover after one click. min={1} makes the first click set only
          // `from`, so a second click is required to complete the range.
          min={1}
          onSelect={handleSelect}
        />
        {draft?.from || draft?.to ? (
          <div className="flex justify-end border-t border-border p-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
              Clear
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
