"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const sessionQueryKey = ["session"] as const;

export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      const { data, error } = await authClient.getSession();
      if (error) {
        throw new Error(error.message || "Failed to load session");
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
