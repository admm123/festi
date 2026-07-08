"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Reads the current session (or null). Used as the building block for the
 * guards below.
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Page guard: redirects unauthenticated users to /login.
 * Use in server components / layouts, where redirecting is the correct UX.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Page guard: redirects non-admins.
 * Use in admin server components / layouts.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }
  return session;
}

/**
 * Action guard: returns the session or null. Server actions decide how to
 * react (return a friendly error to the client instead of redirecting).
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ? session : null;
}

/**
 * Action guard: returns the session only if the user is an admin, otherwise
 * null. Server actions return a friendly error when this is null.
 */
export async function getCurrentAdmin() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}
