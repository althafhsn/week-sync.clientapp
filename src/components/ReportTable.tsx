import Link from "next/link";

import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
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

function actionFor(report: WeeklyReport, mode: "member" | "manager") {
  if (mode === "member") {
    return { href: `/reports/${report.id}`, label: "View" };
  }
  return {
    href: `/team/review/${report.id}`,
    label: report.status === "submitted" ? "Review" : "View",
  };
}

export function ReportTable({
  reports,
  mode,
  showMember = false,
}: {
  reports: WeeklyReport[];
  mode: "member" | "manager";
  showMember?: boolean;
}) {
  const { userName, projectName } = useLookups();

  if (reports.length === 0) {
    return (
      <div className="text-muted-foreground rounded-lg border border-dashed py-10 text-center text-sm">
        No reports to show.
      </div>
    );
  }

  return (
    <>
      {/* Stacked cards below sm */}
      <div className="space-y-3 sm:hidden">
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
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
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
