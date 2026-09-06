"use client";

import { Plus, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ReportHighlightType } from "@/lib/api/types";
import type { HighlightEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EntryListField({
  items,
  typeOptions,
  onChange,
  addLabel,
  keyLabel,
  makeEntry,
}: {
  items: HighlightEntry[];
  typeOptions: ReportHighlightType[];
  onChange: (items: HighlightEntry[]) => void;
  addLabel: string;
  keyLabel: string;
  makeEntry: () => HighlightEntry;
}) {
  function updateItem(id: string, patch: Partial<HighlightEntry>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function addItem() {
    onChange([...items, makeEntry()]);
  }

  function markAsKey(id: string) {
    onChange(items.map((item) => ({ ...item, isKey: item.id === id })));
  }

  return (
    <div className="space-y-3">
      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="size-4" />
        {addLabel}
      </Button>

      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-start"
        >
          <Select
            items={typeOptions.map((t) => ({ value: t.id, label: t.name }))}
            value={item.reportHighlightTypeId}
            onValueChange={(value) => {
              const selected = typeOptions.find((t) => t.id === value);
              if (selected) {
                updateItem(item.id, {
                  reportHighlightTypeId: selected.id,
                  typeName: selected.name,
                });
              }
            }}
          >
            <SelectTrigger className="h-10 w-full sm:w-40">
              <SelectValue>{item.typeName || "Select a type"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={item.description}
            onChange={(e) => updateItem(item.id, { description: e.target.value })}
            placeholder="Description"
            className="h-10 flex-1"
          />

          <div className="flex shrink-0 items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={
                      item.isKey ? `${keyLabel} (selected)` : `Mark as ${keyLabel}`
                    }
                    onClick={() => markAsKey(item.id)}
                  />
                }
              >
                <Star
                  className={cn(
                    "size-4",
                    item.isKey
                      ? "fill-warning text-warning"
                      : "text-muted-foreground"
                  )}
                />
              </TooltipTrigger>
              <TooltipContent>
                {item.isKey ? `This is the ${keyLabel}` : `Mark as ${keyLabel}`}
              </TooltipContent>
            </Tooltip>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={items.length <= 1}
              aria-label="Remove entry"
              onClick={() => removeItem(item.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
