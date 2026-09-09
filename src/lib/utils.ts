export { cn } from "cn"

/** Extracts a human-readable message from an unknown catch value, falling back otherwise. */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

/** Generates a short, non-cryptographic id like `t-x3f9k2` for client-side-only use. */
export function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

/** First letter of the first and last words of a name, e.g. "Jane Doe" -> "JD". */
export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/)
  return (
    (parts[0]?.[0] ?? "") +
    (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "")
  ).toUpperCase()
}
