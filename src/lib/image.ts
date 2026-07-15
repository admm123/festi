/**
 * Shared image constraints and server-side validation, used by the upload
 * server actions. Client-side processing (resize + WebP conversion) happens in
 * `imageProcessing.ts`; this module is the trusted server-side gate.
 */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGE_DIMENSION = 2000;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type ImageValidationResult =
  | { ok: true; bytes: Uint8Array; contentType: string }
  | { ok: false; error: string };

/**
 * Validates an uploaded file: presence, MIME type, size, and magic-bytes
 * sniffing so a mislabeled content-type can't slip through.
 */
export async function validateImageUpload(
  file: unknown,
): Promise<ImageValidationResult> {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No image file was provided." };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Image must be 5MB or smaller." };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as never)) {
    return {
      ok: false,
      error: "Unsupported format. Use JPEG, PNG, or WebP.",
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniffImageType(bytes);
  if (!sniffed) {
    return { ok: false, error: "File does not appear to be a valid image." };
  }

  return { ok: true, bytes, contentType: sniffed };
}

/** Detects the real image type from magic bytes. Returns null if unknown. */
function sniffImageType(bytes: Uint8Array): string | null {
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  // WebP: "RIFF" .... "WEBP"
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}
