"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDateLabel, parseLocalDate, toIsoDate } from "@/lib/date";

export function DateField({
  value,
  onChange,
  minDate,
  className,
}: {
  value: string;
  onChange: (iso: string) => void;
  minDate?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseLocalDate(value);
  const min = minDate ? parseLocalDate(minDate) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-10 w-full justify-start gap-2 font-normal",
              !selected && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="size-4 shrink-0" />
        {selected ? formatDateLabel(selected, true) : "Select a date"}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          disabled={min ? { before: min } : undefined}
          onSelect={(date) => {
            if (date) {
              onChange(toIsoDate(date));
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
