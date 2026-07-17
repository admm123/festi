"use client";

import { Badge } from "@/components/ui/badge";
import type { Rider } from "@/features/community/actions/getRider";
import {
  formatBike,
  ridingStyleLabel,
  skillLevelLabel,
} from "../data/bikeData";

const NOT_SET = <span className="text-muted-foreground">Not set</span>;

/** Read-only display of a rider's biking profile — always lists every field. */
export function RiderProfileInfo({ rider }: { rider: Rider }) {
  const bike = formatBike(rider.bikeBrand, rider.bikeModel);
  const skill = skillLevelLabel(rider.skillLevel);

  return (
    <div className="divide-y">
      <InfoRow label="About">
        {rider.bio ? (
          <p className="whitespace-pre-wrap">{rider.bio}</p>
        ) : (
          NOT_SET
        )}
      </InfoRow>
      <InfoRow label="Location">{rider.location || NOT_SET}</InfoRow>
      <InfoRow label="Bike">{bike || NOT_SET}</InfoRow>
      <InfoRow label="Skill level">{skill || NOT_SET}</InfoRow>
      <InfoRow label="Years riding">
        {rider.yearsRiding != null
          ? `${rider.yearsRiding} ${rider.yearsRiding === 1 ? "year" : "years"}`
          : NOT_SET}
      </InfoRow>
      <InfoRow label="Riding styles">
        {rider.ridingStyles.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {rider.ridingStyles.map((style) => (
              <Badge key={style} variant="secondary">
                {ridingStyleLabel(style)}
              </Badge>
            ))}
          </div>
        ) : (
          NOT_SET
        )}
      </InfoRow>
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:gap-4">
      <span className="w-32 shrink-0 text-sm font-medium text-muted-foreground">
        {label}
      </span>
      <div className="min-w-0 flex-1 text-sm">{children}</div>
    </div>
  );
}
