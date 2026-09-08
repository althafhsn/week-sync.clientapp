"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface NumericInputProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
  onCommit: (value: number) => void;
}

export function NumericInput({
  value,
  min = 0,
  max,
  step = 1,
  integer = false,
  onCommit,
}: NumericInputProps) {
  const [draft, setDraft] = useState(String(value));
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commit() {
    if (draft.trim() === "") {
      setError("Enter a value.");
      return;
    }

    const parsed = Number(draft);

    if (!Number.isFinite(parsed)) {
      setError("Enter a valid number.");
      return;
    }

    if (integer && !Number.isInteger(parsed)) {
      setError("Enter a whole number.");
      return;
    }

    if (parsed < min) {
      setError(`Value cannot be less than ${min}.`);
      return;
    }

    if (max !== undefined && parsed > max) {
      setError(`Value cannot be greater than ${max}.`);
      return;
    }

    setError("");
    onCommit(parsed);
  }

  return (
    <div className="space-y-1">
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setError("");
        }}
        onBlur={commit}
        aria-invalid={error.length > 0}
      />
      {error ? (
        <p className="text-destructive text-xs">{error}</p>
      ) : null}
    </div>
  );
}