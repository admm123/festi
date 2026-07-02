"use server";

import dns from "dns/promises";

export async function validateEmailDomain(email: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    const domain = email.split("@")[1];

    if (!domain) {
      return { valid: false, error: "Invalid email format" };
    }

    // Check MX records for the domain
    const mxRecords = await dns.resolveMx(domain);

    if (!mxRecords || mxRecords.length === 0) {
      return {
        valid: false,
        error: "This email domain doesn't accept emails",
      };
    }

    return { valid: true };
  } catch (error) {
    // DNS errors mean the domain likely doesn't exist or has no MX records
    if (error instanceof Error) {
      if (
        error.message.includes("ENOTFOUND") ||
        error.message.includes("ENODATA")
      ) {
        return {
          valid: false,
          error: "This email domain doesn't exist",
        };
      }
    }

    // For other errors, we'll allow the email (could be network issues)
    console.error("DNS lookup error:", error);
    return { valid: true };
  }
}
