"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

/**
 * A "chip list + manage-members dialog" field: a row of chips for the
 * currently selected items, a button that opens a searchable multi-select
 * list in a Dialog, and a "Done — N selected" footer.
 */
export function EntityPickerField<T>({
  label,
  description,
  items,
  selectedIds,
  getId,
  getLabel,
  getSearchValue,
  getSecondaryLabel,
  getDisabledReason,
  onToggle,
  emptyChipsText,
  manageButtonLabel,
  manageButtonIcon,
  dialogTitle,
  dialogDescription,
  searchPlaceholder,
  emptyResultsText,
}: {
  label: string;
  description: string;
  items: T[];
  selectedIds: string[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  getSearchValue: (item: T) => string;
  getSecondaryLabel?: (item: T) => string | undefined;
  getDisabledReason?: (item: T) => string | undefined;
  onToggle: (id: string) => void;
  emptyChipsText: string;
  manageButtonLabel: string;
  manageButtonIcon: ReactNode;
  dialogTitle: string;
  dialogDescription: string;
  searchPlaceholder: string;
  emptyResultsText: string;
}) {
  const [open, setOpen] = useState(false);

  const selected = items.filter((item) => selectedIds.includes(getId(item)));

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <p className="text-muted-foreground text-sm">{description}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-full border border-input px-3 py-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {selected.length === 0 ? (
            <span className="text-muted-foreground px-1 text-sm">
              {emptyChipsText}
            </span>
          ) : (
            selected.map((item) => (
              <span
                key={getId(item)}
                className="bg-secondary text-secondary-foreground inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium"
              >
                {getLabel(item)}
              </span>
            ))
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 rounded-full"
          onClick={() => setOpen(true)}
        >
          {manageButtonIcon}
          {manageButtonLabel}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <Command className="h-72 rounded-lg border border-border">
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyResultsText}</CommandEmpty>
              <CommandGroup>
                {items.map((item) => {
                  const id = getId(item);
                  const isSelected = selectedIds.includes(id);
                  const secondaryLabel = getSecondaryLabel?.(item);
                  const disabledReason = getDisabledReason?.(item);
                  return (
                    <CommandItem
                      key={id}
                      value={getSearchValue(item)}
                      onSelect={() => onToggle(id)}
                      data-checked={isSelected}
                      disabled={!!disabledReason}
                    >
                      <span className="flex-1">
                        {getLabel(item)}
                        {secondaryLabel ? (
                          <span className="text-muted-foreground ml-1.5 text-xs">
                            {secondaryLabel}
                          </span>
                        ) : null}
                        {disabledReason ? (
                          <span className="text-muted-foreground ml-1.5 text-xs italic">
                            {disabledReason}
                          </span>
                        ) : null}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
          <DialogFooter>
            <Button type="button" onClick={() => setOpen(false)}>
              Done — {selected.length} selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
