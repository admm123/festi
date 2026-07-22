import { NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/guards";
import { createLiveTissotClient } from "@/features/pro/lib/clients";

/** Tissot report ids are opaque tokens; reject anything path-traversal-ish. */
const REPORT_ID_PATTERN = /^[\w.-]{1,128}$/;

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
    return new Response(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${reportId}.pdf"`,
        // The PDFs are immutable once published; let the browser keep them.
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
