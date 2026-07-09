"use client";

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
  ShieldAlertIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsWarning, WarningLevel } from "../types";

const LEVEL_META: Record<
  WarningLevel,
  { icon: typeof InfoIcon; className: string }
> = {
  info: { icon: InfoIcon, className: "" },
  warning: {
    icon: AlertTriangleIcon,
    className:
      "border-amber-500/40 text-amber-600 dark:text-amber-400 [&>svg]:text-amber-500",
  },
  critical: {
    icon: ShieldAlertIcon,
    className:
      "border-destructive/40 text-destructive [&>svg]:text-destructive",
  },
};

type WarningsPanelProps = {
  warnings?: AnalyticsWarning[];
  isLoading: boolean;
};

export function WarningsPanel({ warnings, isLoading }: WarningsPanelProps) {
  if (isLoading || !warnings) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const allClear = warnings.length === 1 && warnings[0].id === "all-clear";

  return (
    <div className="space-y-3">
      {allClear ? (
        <Alert>
          <CheckCircle2Icon />
          <AlertTitle>All clear</AlertTitle>
          <AlertDescription>
            No anomalies detected in the last 24 hours.
          </AlertDescription>
        </Alert>
      ) : (
        warnings.map((warning) => {
          const meta = LEVEL_META[warning.level];
          const Icon = meta.icon;
          return (
            <Alert key={warning.id} className={meta.className}>
              <Icon />
              <AlertTitle className="flex items-center justify-between gap-2">
                <span>{warning.title}</span>
                {warning.count !== undefined && (
                  <span className="tabular-nums">{warning.count}</span>
                )}
              </AlertTitle>
              <AlertDescription>{warning.description}</AlertDescription>
            </Alert>
          );
        })
      )}
    </div>
  );
}
