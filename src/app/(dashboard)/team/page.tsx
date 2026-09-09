"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, Clock3, FileWarning } from "lucide-react";
import { toast } from "sonner";

import { usePageHeader } from "@/components/AppShell";
import { ReportTable } from "@/components/ReportTable";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { TeamAnalytics } from "@/components/TeamAnalytics";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { weekLabel } from "@/lib/demo-data";
import { useLookups, useStore } from "@/lib/store";
import { getErrorMessage, initialsOf } from "@/lib/utils";
import { listUsers, updateUser } from "@/lib/api/users-client";
import { listUserStatuses } from "@/lib/api/user-statuses-client";
import type { User as ApiUser, UserStatus } from "@/lib/api/types";

const PENDING_APPROVAL = "Pending Approval";

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Monday of the actual current calendar week — matches the backend's
// dashboard.service.ts#getSummary computation — rather than the latest week
// any report happens to exist for.
function currentWeekStartKey(): string {
  const now = new Date();
  const diffToMonday = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
  return toDateKey(monday);
}

export default function TeamDashboardPage() {
  const { reports, members } = useStore();
  const { userName, projectName } = useLookups();

  usePageHeader({
    title: "Team dashboard",
    description: "Weekly delivery health and reports awaiting your review.",
  });

  const [pendingUsers, setPendingUsers] = useState<ApiUser[]>([]);
  const [userStatuses, setUserStatuses] = useState<UserStatus[]>([]);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listUsers(["role", "userStatus"]), listUserStatuses()])
      .then(([userList, statusList]) => {
        if (cancelled) return;
        setPendingUsers(userList.filter((u) => u.userStatus?.name === PENDING_APPROVAL));
        setUserStatuses(statusList);
      })
      .catch((error) =>
        toast.error(getErrorMessage(error, "Failed to load pending approvals."))
      );
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDecision(id: string, statusName: "Approved" | "Rejected") {
    const status = userStatuses.find((s) => s.name === statusName);
    if (!status) {
      toast.error(`"${statusName}" status is not configured.`);
      return;
    }
    setDecidingId(id);
    try {
      await updateUser(id, { userStatusId: status.id });
      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success(
        statusName === "Approved" ? "User approved." : "Signup request rejected."
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update approval status."));
    } finally {
      setDecidingId(null);
    }
  }

  const awaitingReview = reports.filter((r) => r.status === "submitted");
  const approved = reports.filter((r) => r.status === "approved");
  const needsCorrection = reports.filter((r) => r.status === "needs_correction");

  const currentWeekStart = currentWeekStartKey();
  const thisWeekReports = reports.filter(
    (r) => r.weekStart === currentWeekStart
  );
  const activeMembers = new Set(thisWeekReports.map((r) => r.memberId)).size;

  const readyForReview = [...awaitingReview]
    .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""))
    .slice(0, 3);

  const teamStatus = members.map((member) => {
    const currentWeekReport = reports.find(
      (r) => r.memberId === member.id && r.weekStart === currentWeekStart
    );
    return { member, latest: currentWeekReport };
  });

  const latestReports = [...reports]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Awaiting review"
          value={awaitingReview.length}
          icon={Clock3}
          tone="warning"
        />
        <StatCard
          label="Approved"
          value={approved.length}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Needs correction"
          value={needsCorrection.length}
          icon={FileWarning}
          tone="warning"
        />
        <StatCard
          label="This week"
          value={thisWeekReports.length}
          icon={CalendarClock}
          hint={`${activeMembers} active member${activeMembers === 1 ? "" : "s"}`}
          tone="info"
        />
      </div>

      {pendingUsers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Pending approvals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-warning/15 text-warning shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">
                    Pending approval
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleDecision(user.id, "Approved")}
                    disabled={decidingId === user.id}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href="/users" />}
                  >
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <TeamAnalytics reports={reports} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ready for review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {readyForReview.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nothing is waiting for review.
              </p>
            ) : (
              readyForReview.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {userName(report.memberId)}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {weekLabel(report.weekStart, report.weekEnd)} ·{" "}
                      {projectName(report.projectId)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={report.status} />
                    <Button
                      size="sm"
                      render={<Link href={`/team/review/${report.id}`} />}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team status</CardTitle>
            <CardAction>
              <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                This week
              </span>
            </CardAction>
          </CardHeader>
          <CardContent className="max-h-72 space-y-0.5 overflow-y-auto">
            {teamStatus.map(({ member, latest }) => (
              <div
                key={member.id}
                className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5 hover:bg-muted/50"
              >
                <Avatar size="sm" className="shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {initialsOf(member.name)}
                  </AvatarFallback>
                </Avatar>
                <p className="min-w-0 flex-1 truncate text-sm">
                  <span className="font-medium">{member.name}</span>
                  {member.team ? (
                    <span className="text-muted-foreground"> · {member.team}</span>
                  ) : null}
                </p>
                {latest ? (
                  <StatusBadge status={latest.status} className="h-5 px-2 text-[0.7rem]" />
                ) : (
                  <span className="text-muted-foreground shrink-0 rounded-full border border-dashed border-border px-2 py-0.5 text-[0.7rem]">
                    No report
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Latest reports
        </h2>
        <ReportTable reports={latestReports} mode="manager" showMember />
      </div>
    </div>
  );
}
