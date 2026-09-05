"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { weekLabel } from "@/lib/demo-data";
import { STATUS_LABEL, type ReportStatus, type WeeklyReport } from "@/lib/types";

const STATUS_COLORS: Record<ReportStatus, string> = {
  approved: "var(--success)",
  submitted: "var(--info)",
  needs_correction: "var(--warning)",
  draft: "var(--muted-foreground)",
};

const tooltipStyle = {
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--shadow-card)",
  fontSize: 12,
};

export function TeamAnalytics({ reports }: { reports: WeeklyReport[] }) {
  const weekMap = new Map<string, string>();
  reports.forEach((r) => weekMap.set(r.weekStart, r.weekEnd));
  const activeWeeks = Array.from(weekMap.entries())
    .map(([start, end]) => ({ start, end }))
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(-5);

  const activityData = activeWeeks.map((w) => {
    const label = weekLabel(w.start, w.end);
    return {
      week: label.split(" – ")[0] ?? label,
      count: reports.filter((r) => r.weekStart === w.start).length,
    };
  });

  const statusOrder: ReportStatus[] = [
    "approved",
    "submitted",
    "needs_correction",
    "draft",
  ];
  const statusData = statusOrder
    .map((status) => ({
      status,
      label: STATUS_LABEL[status],
      value: reports.filter((r) => r.status === status).length,
    }))
    .filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Reporting activity</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="week"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review status</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center gap-4">
          <div className="h-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="60%"
                  outerRadius="90%"
                  paddingAngle={2}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1.5 text-sm">
            {statusData.map((entry) => (
              <li key={entry.status} className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: STATUS_COLORS[entry.status] }}
                />
                <span className="text-muted-foreground">{entry.label}</span>
                <span className="font-medium">{entry.value}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
