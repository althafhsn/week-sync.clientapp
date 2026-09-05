"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NextWeekTask } from "@/lib/types";

export function NextWeekTaskList({
  items,
  onChange,
}: {
  items: NextWeekTask[];
  onChange: (items: NextWeekTask[]) => void;
}) {
  function updateItem(id: string, description: string) {
    onChange(items.map((item) => (item.id === id ? { ...item, description } : item)));
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function addItem() {
    onChange([
      ...items,
      { id: `nw-${Math.random().toString(36).slice(2, 8)}`, description: "" },
    ]);
  }

  return (
    <div className="space-y-3">
      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="size-4" />
        Add task
      </Button>

      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <Input
            value={item.description}
            onChange={(e) => updateItem(item.id, e.target.value)}
            placeholder={`Task ${index + 1}`}
            className="h-10 flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={items.length <= 1}
            aria-label="Remove task"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
