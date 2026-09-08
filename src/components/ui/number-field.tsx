"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

function clamp(value: number, min?: number, max?: number): number {
  let result = value;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return result;
}

/** Strips a redundant leading zero left over from typing over a "0" default
 * without clearing it first — "05" -> "5", "0051" -> "51" — while leaving a
 * bare "0" or a decimal in progress ("0.5") untouched. */
function stripLeadingZero(raw: string): string {
  const sign = raw.startsWith("-") ? "-" : "";
  const rest = sign ? raw.slice(1) : raw;
  return sign + rest.replace(/^0+(?=\d)/, "");
}

/** A numeric `<Input>` that tracks its own display text while focused, so
 * clearing the field to type a fresh value doesn't get instantly snapped
 * back to "0" (or whatever the last committed value was) after every
 * keystroke. Valid intermediate values are still pushed up live; an empty
 * or partial value (e.g. "-") is only normalized back to a number on blur. */
export function NumberField({
  id,
  value,
  onChange,
  min,
  max,
  className,
  placeholder,
}: {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  placeholder?: string;
}) {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(String(value));
    }
  }, [value, focused]);

  return (
    <Input
      id={id}
      type="number"
      min={min}
      max={max}
      placeholder={placeholder}
      className={className}
      value={text}
      onFocus={() => setFocused(true)}
      onChange={(e) => {
        const raw = stripLeadingZero(e.target.value);
        setText(raw);
        if (raw.trim() === "" || raw === "-") {
          // Field is mid-edit (cleared, or just typed a leading minus) —
          // don't force it back to a number yet.
          return;
        }
        const parsed = Number(raw);
        if (!Number.isNaN(parsed)) {
          onChange(clamp(parsed, min, max));
        }
      }}
      onBlur={() => {
        setFocused(false);
        const parsed = Number(text);
        const normalized = clamp(Number.isNaN(parsed) ? 0 : parsed, min, max);
        setText(String(normalized));
        onChange(normalized);
      }}
    />
  );
}
