"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RecentActivityEntry } from "../types";

function actionVariant(
  action: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (action.endsWith("_FAILED")) return "destructive";
  if (action.startsWith("USER_BANNED") || action.includes("REMOVED"))
    return "destructive";
  if (action.startsWith("USER_")) return "secondary";
  return "outline";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

type RecentActivityTableProps = {
  entries?: RecentActivityEntry[];
  isLoading: boolean;
};

export function RecentActivityTable({
  entries,
  isLoading,
}: RecentActivityTableProps) {
  if (isLoading || !entries) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>IP</TableHead>
            <TableHead className="text-right">When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length ? (
            entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <Badge variant={actionVariant(entry.action)}>
                    {entry.action.replaceAll("_", " ").toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[280px] truncate text-muted-foreground">
                  {entry.description ?? "—"}
                </TableCell>
                <TableCell className="text-sm">
                  {entry.actorEmail ?? "system"}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {entry.ipAddress ?? "—"}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {timeAgo(entry.createdAt)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No activity recorded yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
