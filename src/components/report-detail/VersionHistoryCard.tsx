"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { weekLabel } from "@/lib/demo-data";
import { apiReportHistoryDetailToVersion } from "@/lib/api/mappers";
import { getReportHistoryEntry } from "@/lib/api/reports-client";
import { totalHours } from "@/lib/types";
import type { ReportVersion } from "@/lib/types";

export function VersionHistoryCard({
  reportId,
  versions,
  approved,
  submittedBy,
}: {
  reportId: string;
  versions: ReportVersion[];
  approved: boolean;
  /** Name of the report's owner — every archived version was submitted by
   * them, since the backend doesn't track a separate editor per version. */
  submittedBy?: string;
}) {
  const [open, setOpen] = useState<ReportVersion | null>(null);
  const [loading, setLoading] = useState(false);

  async function viewVersion(version: ReportVersion) {
    setOpen(version);
    const historyId = version.id;
    if (version.snapshot || !historyId) return;
    setLoading(true);
    try {
      const detail = await getReportHistoryEntry(reportId, historyId);
      setOpen(apiReportHistoryDetailToVersion(detail));
    } catch {
      setOpen(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Version history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {versions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No history yet.</p>
          ) : (
            versions.map((version) => (
              <button
                key={version.version}
                type="button"
                onClick={() => viewVersion(version)}
                disabled={!version.id}
                className="hover:bg-accent -mx-2 flex w-full items-start justify-between gap-2 rounded-md px-2 py-2 text-left text-sm disabled:cursor-default disabled:hover:bg-transparent"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium">
                    v{version.version} · {version.action}
                    {version.weekStart && version.weekEnd ? (
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        · {weekLabel(version.weekStart, version.weekEnd)}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {version.submittedAt ? (
                      <>Submitted {new Date(version.submittedAt).toLocaleString()}</>
                    ) : null}
                    {submittedBy ? <> by {submittedBy}</> : null}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Reviewed {new Date(version.at).toLocaleString()}
                  </p>
                  {version.note ? (
                    <p className="line-clamp-2 pt-0.5 text-xs italic">
                      &ldquo;{version.note}&rdquo;
                    </p>
                  ) : null}
                </div>
                {version.id ? (
                  <ChevronRight className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                ) : null}
              </button>
            ))
          )}
          {approved ? (
            <div className="text-success flex items-center gap-1.5 pt-2 text-sm font-medium">
              <CheckCircle2 className="size-4" />
              Review completed
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={open !== null} onOpenChange={(next) => !next && setOpen(null)}>
        <DialogContent className="sm:max-w-lg">
          {open ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  Version {open.version} · {open.action}
                </DialogTitle>
                <div className="text-muted-foreground space-y-0.5 text-xs">
                  {open.weekStart && open.weekEnd ? (
                    <p>Week of {weekLabel(open.weekStart, open.weekEnd)}</p>
                  ) : null}
                  {open.submittedAt ? (
                    <p>Submitted {new Date(open.submittedAt).toLocaleString()}</p>
                  ) : null}
                  <p>Reviewed {new Date(open.at).toLocaleString()}</p>
                  {submittedBy ? <p>By {submittedBy}</p> : null}
                </div>
              </DialogHeader>
              {loading || !open.snapshot ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <div className="max-h-[60vh] space-y-4 overflow-y-auto text-sm">
                  {open.note ? (
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">
                        Manager comment
                      </p>
                      <p>{open.note}</p>
                    </div>
                  ) : null}

                  <div>
                    <p className="text-muted-foreground text-xs font-medium">
                      Tasks ({open.snapshot.tasks.length})
                    </p>
                    {open.snapshot.tasks.length === 0 ? (
                      <p className="text-muted-foreground">None</p>
                    ) : (
                      <ul className="list-inside list-disc">
                        {open.snapshot.tasks.map((t) => (
                          <li key={t.id}>
                            {t.name} — {t.statusName || "No status"}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <p className="text-muted-foreground text-xs font-medium">
                      Achievements ({open.snapshot.achievements.length}) · Blockers (
                      {open.snapshot.blockers.length})
                    </p>
                    <ul className="list-inside list-disc">
                      {[...open.snapshot.achievements, ...open.snapshot.blockers].map((h) => (
                        <li key={h.id}>{h.description || h.typeName}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-xs font-medium">
                      Total hours logged
                    </p>
                    <p>{totalHours(open.snapshot.hours)}h</p>
                  </div>

                  {open.snapshot.notes ? (
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">Notes</p>
                      <p>{open.snapshot.notes}</p>
                    </div>
                  ) : null}

                  {open.snapshot.links ? (
                    <div>
                      <p className="text-muted-foreground text-xs font-medium">Links</p>
                      <p className="break-all">{open.snapshot.links}</p>
                    </div>
                  ) : null}
                </div>
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
