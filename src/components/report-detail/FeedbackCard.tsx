import { CheckCircle2, MessageSquare } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ManagerFeedback } from "@/lib/types";

export function FeedbackCard({ feedback }: { feedback: ManagerFeedback[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manager feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {feedback.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No manager feedback yet.
          </p>
        ) : (
          feedback.map((entry) => {
            const approved = entry.decision === "approved";
            const Icon = approved ? CheckCircle2 : MessageSquare;
            return (
              <div key={entry.id} className="flex gap-2.5">
                <Icon
                  className={
                    approved
                      ? "text-success mt-0.5 size-4 shrink-0"
                      : "text-warning mt-0.5 size-4 shrink-0"
                  }
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {approved ? "Approved" : "Changes requested"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {entry.comment}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {new Date(entry.at).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
