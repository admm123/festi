import { NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/guards";
import { createLiveTissotClient } from "@/features/pro/lib/clients";

/** Tissot report ids are opaque tokens; reject anything path-traversal-ish. */
const REPORT_ID_PATTERN = /^[\w.-]{1,128}$/;

/**
 * Not every report is a PDF: ranking reports are PDFs, but the "Photofinish"
 * report is a JPG or PNG image (and the registry occasionally reports a bogus
 * `extension` like "unknow"). Serving image bytes as `application/pdf` makes the
 * browser render a blank/broken page, so we sniff the real type from the leading
 * magic bytes and fall back to PDF only when nothing else matches.
 */
function sniffFileType(bytes: ArrayBuffer): {
  contentType: string;
  ext: string;
} {
  const head = new Uint8Array(bytes, 0, Math.min(8, bytes.byteLength));
  const startsWith = (...sig: number[]) =>
    sig.length <= head.length && sig.every((b, i) => head[i] === b);

  // JPEG: FF D8 FF
  if (startsWith(0xff, 0xd8, 0xff)) {
    return { contentType: "image/jpeg", ext: "jpg" };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (startsWith(0x89, 0x50, 0x4e, 0x47)) {
    return { contentType: "image/png", ext: "png" };
  }
  // PDF: 25 50 44 46 ("%PDF")
  return { contentType: "application/pdf", ext: "pdf" };
}

/**
 * Authenticated proxy for official Tissot report PDFs, so the browser never
 * talks to prod.server.tissottiming.com directly. The uncached client is used
 * because Next's fetch cache is not meant for multi-MB binary payloads.
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/pro/reports/[reportId]">,
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 },
    );
  }

  const { reportId } = await ctx.params;
  if (!REPORT_ID_PATTERN.test(reportId)) {
    return NextResponse.json({ error: "Invalid report id." }, { status: 400 });
  }

  try {
    const bytes = await createLiveTissotClient().getFile(reportId);
    const { contentType, ext } = sniffFileType(bytes);
    return new Response(bytes, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${reportId}.${ext}"`,
        // The reports are immutable once published; let the browser keep them.
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "The report could not be fetched." },
      { status: 502 },
    );
  }
}
