/**
 * Builds a GPX 1.1 document string from an ordered list of track points.
 * Runtime-agnostic (no DOM), so it works on the Workers runtime.
 */

export type GpxPoint = {
  lat: number;
  lng: number;
  ele?: number;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildGpx(name: string, points: GpxPoint[]): string {
  const safeName = escapeXml(name);
  const time = new Date().toISOString();

  const trkpts = points
    .map((point) => {
      const ele =
        typeof point.ele === "number"
          ? `<ele>${point.ele.toFixed(1)}</ele>`
          : "";
      return `      <trkpt lat="${point.lat.toFixed(6)}" lon="${point.lng.toFixed(6)}">${ele}</trkpt>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Festi" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${safeName}</name>
    <time>${time}</time>
  </metadata>
  <trk>
    <name>${safeName}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>
`;
}

/** Turns a ride title into a safe GPX filename. */
export function gpxFilename(title: string): string {
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "route";
  return `${slug}.gpx`;
}
