"use client";

import { useCallback, useEffect, useState } from "react";

export interface PaginatedResult<T> {
  data: T[];
  count: number;
}

export interface UsePaginatedCrudOptions<T> {
  initialPageSize: string;
  /** Fetches one page's worth of items (`pageSize !== "all"`). */
  loadPage: (page: number, pageSize: number) => Promise<PaginatedResult<T>>;
  /** Fetches every item at once (`pageSize === "all"`). */
  loadAll: () => Promise<T[]>;
}

/**
 * Shared state and behavior behind a paginated admin CRUD page (users,
 * teams, projects): the current page's items, `page`/`pageSize`/`total`,
 * the derived `pageCount`, resetting to page 1 whenever `pageSize` changes,
 * and stepping back a page after deleting the last row on a page beyond the
 * first (so the view doesn't get stranded on now-empty results).
 *
 * Entity-specific concerns — the create/update form, its own draft state,
 * and any secondary lookups loaded alongside the page — stay in the page.
 */
export function usePaginatedCrud<T>({
  initialPageSize,
  loadPage,
  loadAll,
}: UsePaginatedCrudOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [loading, setLoading] = useState(true);

  const pageCount =
    pageSize === "all" ? 1 : Math.max(1, Math.ceil(total / Number(pageSize)));

  const load = useCallback(
    (pageToLoad: number, size: string) => {
      if (size === "all") {
        return loadAll().then((data) => {
          setItems(data);
          setTotal(data.length);
        });
      }
      return loadPage(pageToLoad, Number(size)).then((result) => {
        setItems(result.data);
        setTotal(result.count);
      });
    },
    [loadPage, loadAll]
  );

  // Any page-size change invalidates the current page number.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [pageSize]);

  // Dropping the last row on a page beyond the first steps back a page
  // instead of leaving the view stranded on now-empty results. Call this
  // after a successful delete.
  const stepBackIfLastRow = useCallback(() => {
    const targetPage =
      pageSize !== "all" && items.length === 1 && page > 1 ? page - 1 : page;
    if (targetPage !== page) {
      setPage(targetPage);
      return Promise.resolve();
    }
    return load(targetPage, pageSize);
  }, [items.length, page, pageSize, load]);

  return {
    items,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    loading,
    setLoading,
    pageCount,
    load,
    stepBackIfLastRow,
  };
}
