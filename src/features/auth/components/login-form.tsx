"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { ArrowLeftIcon, Loader2Icon, ZapIcon } from "lucide-react";
import { loginSchema, type LoginFormData } from "../schemas";
import { ParticleBackground } from "@/components/particle-background";
import { signIn, sendVerificationEmail } from "@/lib/auth-client";
import { getBanInfo } from "../actions/get-ban-info";
import { error } from "console";
import { formatBanExpiry } from "../utils/formatBanExpiry";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleResendVerification = async () => {
    setIsResending(true);

    const result = await sendVerificationEmail({
      email: getValues("email"),
    });

    if (result.error) {
      toast.error(
        result.error.message || "Failed to resend verification email",
      );
    } else {
      toast.success("Verification email sent! Check your inbox.");
      setShowResendButton(false);
    }
    setIsResending(false);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setShowResendButton(false);

    const result = await signIn.email({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      // Check if the error is about email not being verified
      if (result.error.code === "EMAIL_NOT_VERIFIED") {
        setShowResendButton(true);
        toast.error("Please verify your email before signing in", {
          description: "Check your inbox for a verification link.",
        });
      } else if (result.error.code === "BANNED_USER") {
        const ban = await getBanInfo(data.email);

        toast.error("Your account has been banned.", {
          description: (
            <div>
              <p>
                <strong>Reason: </strong> {ban?.reason ?? "No reason provided"}
              </p>
              <p>
                <strong>Duration: </strong>
                {formatBanExpiry(ban?.expires ?? null)}
              </p>
            </div>
          ),
        });

        setIsLoading(false);
        return;
      } else {
        toast.error(result.error.message);
      }
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Back Arrow */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back
      </Link>

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/50 via-background to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent" />

      {/* Interactive Particles */}
      <ParticleBackground />

      <Card className="relative w-full max-w-md border-red-500/20 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700">
            <ZapIcon className="size-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="rider@example.com"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-red-500 hover:text-red-400"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {showResendButton && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full border-amber-500/50 text-amber-200 hover:bg-amber-500/20"
              >
                {isResending && (
                  <Loader2Icon className="mr-2 size-3 animate-spin" />
                )}
                Resend verification email
              </Button>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-red-700"
            >
              {isLoading && (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              )}
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-red-500 hover:text-red-400"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
