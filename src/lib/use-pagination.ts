import { useEffect, useState } from "react";

/** Client-side pagination over an already-loaded array. Resets to page 1
 * whenever `items` changes identity (e.g. a filter/search narrows the
 * result set), and clamps the current page if it would otherwise land past
 * the end (e.g. the last item on the last page was just removed). */
export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);

  // Intentional: reset to page 1 only when the array identity changes (a new
  // filter/search/reload), not on every render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [items]);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return { page: safePage, setPage, pageCount, pageItems, total: items.length };
}
