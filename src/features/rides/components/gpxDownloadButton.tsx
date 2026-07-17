"use client";

import { DownloadIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getRideGpx } from "../actions/getRideGpx";

type GpxDownloadButtonProps = {
  rideId: string;
};

/** Downloads the ride route as a GPX file (creator + approved riders only). */
export function GpxDownloadButton({ rideId }: GpxDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const result = await getRideGpx(rideId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const blob = new Blob([result.gpx], {
        type: "application/gpx+xml",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not download the GPX. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <DownloadIcon className="size-4" />
      )}
      GPX
    </Button>
  );
}
