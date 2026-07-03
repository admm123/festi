export function formatBanExpiry(expires: string | null) {
  if (!expires) return "Permanent";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(expires));
}
