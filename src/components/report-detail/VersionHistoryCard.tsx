import { CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLookups } from "@/lib/store";
import type { ReportVersion } from "@/lib/types";

export function VersionHistoryCard({
  versions,
  approved,
}: {
  versions: ReportVersion[];
  approved: boolean;
}) {
  const { userName } = useLookups();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Version history</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {versions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No history yet.</p>
        ) : (
          versions.map((version) => (
            <div key={version.version} className="text-sm">
              <p className="font-medium">
                v{version.version} · {version.action}
              </p>
              <p className="text-muted-foreground text-xs">
                {new Date(version.at).toLocaleString()} · {userName(version.by)}
              </p>
            </div>
          ))
        )}
        {approved ? (
          <div className="text-success flex items-center gap-1.5 text-sm font-medium">
            <CheckCircle2 className="size-4" />
            Review completed
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
