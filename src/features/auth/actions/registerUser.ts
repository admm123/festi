"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { type RegisterFormData, registerSchema } from "../schemas";
import { checkUsernameAvailable } from "./checkAvailability";
import { validateEmailDomain } from "./validateEmail";
import { Logger } from "@/features/logger";
import { ActivityAction } from "@/features/logger/logger";

/**
 * Single entry point for registration. Runs every check server-side in one
 * round trip and returns a friendly error as data (thrown errors are redacted
 * by Next.js in production).
 */
export async function registerUser(input: RegisterFormData) {
  // Never trust client input on a public endpoint.
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: "Invalid registration data.",
    };
  }

  const { firstName, lastName, username, email, password } = parsed.data;

  const emailValidation = await validateEmailDomain(email);
  if (!emailValidation.valid) {
    return {
      success: false as const,
      error: emailValidation.error ?? "Invalid email domain.",
    };
  }

  // A duplicate email is intentionally NOT checked here: better-auth returns a
  // generic success for existing emails (enumeration protection) and notifies
  // the real account owner via onExistingUserSignUp. See src/lib/auth.ts.

  // Username is a custom field, so better-auth can't produce a friendly
  // "username taken" message from the DB unique violation — check it here.
  const usernameAvailable = await checkUsernameAvailable(username);
  if (!usernameAvailable.available) {
    return {
      success: false as const,
      error: usernameAvailable.error ?? "Username already taken.",
    };
  }

  try {
    const user = await auth.api.signUpEmail({
      headers: await headers(),
      body: {
        email,
        password,
        name: `${firstName} ${lastName}`,
        username,
      },
    });

    await Logger.log(
      ActivityAction.USER_REGISTERED,
      `${email} user just registered!`,
      {
        actorId: user.user.id,
        targetType: "Register",
        metadata: { username: user.user.username, email: user.user.email },
      },
    );
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Registration failed.",
    };
  }

  return { success: true as const, email };
}
