import { apiFetch } from "@/lib/api/client-fetch";
import type { PaginatedResult } from "@/lib/api/types";

// Mirrors the backend's MAX_PAGE_SIZE (week-sync.api/src/common/pagination.util.ts).
const MAX_PAGE_SIZE = 100;

function appendPaging(path: string, page: number, pageSize: number): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}page=${page}&pageSize=${pageSize}`;
}

/** Loops a paginated list endpoint until every row has been fetched, instead
 * of silently returning only the first page. `basePath` should already
 * include any `include=`/`filters.*` query params but no `page`/`pageSize`. */
export async function fetchAllPages<T>(basePath: string): Promise<T[]> {
  const all: T[] = [];
  let page = 1;

  for (;;) {
    const result = await apiFetch<PaginatedResult<T>>(
      appendPaging(basePath, page, MAX_PAGE_SIZE)
    );
    all.push(...result.data);
    if (result.data.length < MAX_PAGE_SIZE || all.length >= result.count) {
      break;
    }
    page += 1;
  }

  return all;
}
