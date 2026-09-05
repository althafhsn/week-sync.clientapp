"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { usePageHeader } from "@/components/AppShell";
import { ReportTable } from "@/components/ReportTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { users, reports, projects } = useStore();

  const member = users.find((u) => u.id === id);
  const memberReports = member
    ? reports
        .filter((r) => r.memberId === member.id)
        .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
    : [];
  const assignedProjects = member
    ? projects.filter((p) => p.memberIds.includes(member.id))
    : [];

  usePageHeader({
    title: member ? member.name : "Member not found",
    description: member ? `${member.title} · ${member.team} team` : undefined,
  });

  if (!member) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center text-sm">
        <p>Member not found.</p>
        <Button size="sm" variant="outline" render={<Link href="/users" />}>
          Back to users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            <span className="text-muted-foreground">Email:</span>{" "}
            {member.email}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Assigned projects:</span>{" "}
            {assignedProjects.length > 0
              ? assignedProjects.map((p) => p.name).join(", ")
              : "None"}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Reports</h2>
        <ReportTable reports={memberReports} mode="manager" />
      </div>
    </div>
  );
}
