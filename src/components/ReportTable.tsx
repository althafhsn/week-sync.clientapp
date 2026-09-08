import Link from "next/link";

import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLookups } from "@/lib/store";
import { totalHours, type WeeklyReport } from "@/lib/types";
import { weekLabel } from "@/lib/demo-data";

const DEFAULT_SKELETON_ROWS = 5;

// Header (2.5rem) + 10 rows (2.5rem each) — the desktop table always
// reserves this much height so the pagination bar sits in a fixed spot
// beneath it, whether the page has 1 row or 50.
const DESKTOP_TABLE_HEIGHT = "h-110";

function actionFor(report: WeeklyReport, mode: "member" | "manager") {
  if (mode === "member") {
    return { href: `/reports/${report.id}`, label: "View" };
  }
  return {
    href: `/team/review/${report.id}`,
    label: report.status === "submitted" ? "Review" : "View",
  };
}

function ReportTableSkeleton({
  showMember,
  rows,
  paginated,
}: {
  showMember: boolean;
  rows: number;
  paginated: boolean;
}) {
  return (
    <>
      {/* Stacked cards below sm */}
      <div className="space-y-3 sm:hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/5" />
                {showMember ? <Skeleton className="h-3 w-1/3" /> : null}
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Table at sm and up */}
      <div
        className={`hidden overflow-y-auto rounded-lg border border-border sm:block ${paginated ? DESKTOP_TABLE_HEIGHT : ""}`}
      >
        <Table>
          <TableHeader className="bg-card sticky top-0 z-10">
            <TableRow>
              <TableHead>Week</TableHead>
              {showMember ? <TableHead>Member</TableHead> : null}
              <TableHead>Project</TableHead>
              <TableHead>Tasks</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                {showMember ? (
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                ) : null}
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-6" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-10" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-8 w-16 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export function ReportTable({
  reports,
  mode,
  showMember = false,
  loading = false,
  skeletonRows = DEFAULT_SKELETON_ROWS,
  paginated = false,
}: {
  reports: WeeklyReport[];
  mode: "member" | "manager";
  showMember?: boolean;
  loading?: boolean;
  /** Row count for the loading skeleton — pass the active page size so the
   * placeholder matches the shape of the results about to land. */
  skeletonRows?: number;
  /** Reserve a fixed height for a full page of results, so a page-size
   * control's pagination bar sits in a consistent spot regardless of how
   * many rows the current page actually has. Only meaningful for pages
   * with their own pagination controls — a plain top-N list (dashboard,
   * "ready for review", ...) should size to its own content instead. */
  paginated?: boolean;
}) {
  const { userName, projectName } = useLookups();

  if (loading) {
    return (
      <ReportTableSkeleton
        showMember={showMember}
        rows={skeletonRows}
        paginated={paginated}
      />
    );
  }

  if (reports.length === 0) {
    return (
      <div
        className={`text-muted-foreground flex items-center justify-center rounded-lg border border-dashed py-10 text-center text-sm ${paginated ? "sm:h-110 sm:py-0" : ""}`}
      >
        No reports to show.
      </div>
    );
  }

  return (
    <>
      {/* Stacked cards below sm */}
      <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1 sm:hidden">
        {reports.map((report) => {
          const action = actionFor(report, mode);
          return (
            <div
              key={report.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {weekLabel(report.weekStart, report.weekEnd)}
                  </p>
                  {showMember ? (
                    <p className="text-muted-foreground truncate text-xs">
                      {userName(report.memberId)}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground truncate text-xs">
                    {projectName(report.projectId)}
                  </p>
                </div>
                <StatusBadge status={report.status} />
              </div>
              <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
                <span>
                  {report.tasks.length} tasks · {totalHours(report.hours)}h
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  render={<Link href={action.href} />}
                >
                  {action.label}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table at sm and up */}
      <div
        className={`hidden overflow-y-auto rounded-lg border border-border sm:block ${paginated ? DESKTOP_TABLE_HEIGHT : ""}`}
      >
        <Table>
          <TableHeader className="bg-card sticky top-0 z-10">
            <TableRow>
              <TableHead>Week</TableHead>
              {showMember ? <TableHead>Member</TableHead> : null}
              <TableHead>Project</TableHead>
              <TableHead>Tasks</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => {
              const action = actionFor(report, mode);
              return (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    {weekLabel(report.weekStart, report.weekEnd)}
                  </TableCell>
                  {showMember ? (
                    <TableCell>{userName(report.memberId)}</TableCell>
                  ) : null}
                  <TableCell>{projectName(report.projectId)}</TableCell>
                  <TableCell>{report.tasks.length}</TableCell>
                  <TableCell>{totalHours(report.hours)}h</TableCell>
                  <TableCell>
                    <StatusBadge status={report.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      render={<Link href={action.href} />}
                    >
                      {action.label}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
