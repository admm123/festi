"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("You must be signed in.");
  }
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  // Use better-auth's role field (lowercase "admin")
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }
  return session;
}

export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/");
}
