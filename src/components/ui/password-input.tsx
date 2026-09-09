"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type" | "placeholder">) {
  const [reveal, setReveal] = React.useState(false);

  return (
    <InputGroup className={className}>
      <InputGroupInput
        {...props}
        type={reveal ? "text" : "password"}
        placeholder={reveal ? "Password" : "••••••••"}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-sm"
          aria-label={reveal ? "Hide password" : "Show password"}
          onClick={() => setReveal((v) => !v)}
        >
          {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
