"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeftIcon,
  Loader2Icon,
  CheckCircleIcon,
  ZapIcon,
} from "lucide-react";
import { ParticleBackground } from "@/components/particle-background";
import { resetPassword } from "@/lib/auth-client";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    setIsLoading(true);

    const result = await resetPassword({
      newPassword: data.password,
      token,
    });

    if (result.error) {
      toast.error(result.error.message || "Failed to reset password");
      setIsLoading(false);
      return;
    }

    setResetComplete(true);
    setIsLoading(false);
  };

  if (!token) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/50 via-background to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent" />

        <ParticleBackground />

        <Card className="relative w-full max-w-md border-red-500/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700">
              <ZapIcon className="size-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Invalid link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link
              href="/forgot-password"
              className="font-medium text-red-500 hover:text-red-400"
            >
              Request a new reset link
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetComplete) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/50 via-background to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent" />

        <ParticleBackground />

        <Card className="relative w-full max-w-md border-red-500/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600">
              <CheckCircleIcon className="size-7 text-white" />
            </div>
            <CardTitle className="text-2xl">Password reset!</CardTitle>
            <CardDescription className="pt-2">
              Your password has been successfully reset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-red-700"
            >
              Sign in with new password
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <Link
        href="/login"
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back to login
      </Link>

      <div className="absolute inset-0 bg-gradient-to-br from-red-950/50 via-background to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent" />

      <ParticleBackground />

      <Card className="relative w-full max-w-md border-red-500/20 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700">
            <ZapIcon className="size-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            onSubmit={handleSubmit(onSubmit, () => {
              const firstError = Object.values(errors)[0];
              if (firstError?.message) {
                toast.error(firstError.message);
              }
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                aria-invalid={!!errors.confirmPassword}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-red-700"
            >
              {isLoading && (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              )}
              Reset password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
