"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ElevationPoint } from "../types";

type ElevationChartProps = {
  data: ElevationPoint[];
  className?: string;
  /** Called with the hovered point (or null on leave) to highlight the map. */
  onHover?: (point: ElevationPoint | null) => void;
};

/**
 * Elevation profile as a filled area chart (distance in km vs. elevation in m).
 * Renders nothing when there is no usable profile.
 */
export function ElevationChart({
  data,
  className,
  onHover,
}: ElevationChartProps) {
  if (data.length < 2) {
    return (
      <div className={className}>
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Elevation</span>
        </div>
        <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
          Add points on the map to see the elevation profile.
        </div>
      </div>
    );
  }

  const elevations = data.map((point) => point.elevation);
  const min = Math.min(...elevations);
  const max = Math.max(...elevations);
  const pad = Math.max(10, Math.round((max - min) * 0.1));

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Elevation</span>
        <span>
          {min} m – {max} m
        </span>
      </div>
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 8, bottom: 0, left: -8 }}
            onMouseMove={(state) => {
              if (!onHover) return;
              const s = state as {
                isTooltipActive?: boolean;
                activeTooltipIndex?: number | null;
                activeIndex?: number | null;
                activeLabel?: number | string | null;
              };
              if (s.isTooltipActive === false) {
                onHover(null);
                return;
              }
              const idx = s.activeTooltipIndex ?? s.activeIndex ?? null;
              if (idx != null && idx >= 0 && idx < data.length) {
                onHover(data[idx]);
                return;
              }
              // Fallback: match by the active x-axis label (distance).
              if (s.activeLabel != null) {
                const label = Number(s.activeLabel);
                const match = data.find((p) => p.distance === label);
                if (match) {
                  onHover(match);
                  return;
                }
              }
              onHover(null);
            }}
            onMouseLeave={() => onHover?.(null)}
          >
            <defs>
              <linearGradient id="elevationFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="distance"
              type="number"
              domain={[0, "dataMax"]}
              tickFormatter={(value) => `${value} km`}
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-muted-foreground"
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              domain={[min - pad, max + pad]}
              tickFormatter={(value) => `${value}`}
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-muted-foreground"
              tickLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ stroke: "#ef4444", strokeWidth: 1 }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid rgba(239,68,68,0.3)",
                fontSize: 12,
                padding: "6px 10px",
              }}
              labelFormatter={(value) => `${value} km`}
              formatter={(value) => [`${value} m`, "Elevation"]}
            />
            <Area
              type="monotone"
              dataKey="elevation"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#elevationFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
