"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeftIcon,
  Loader2Icon,
  MailCheckIcon,
  ZapIcon,
} from "lucide-react";
import { registerSchema, type RegisterFormData } from "../schemas";
import { ParticleBackground } from "@/components/particle-background";
import { signUp } from "@/lib/auth-client";
import { validateEmailDomain } from "../actions/validate-email";
import {
  checkUsernameAvailable,
  checkEmailAvailable,
} from "../actions/check-availability";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const termsValue = watch("terms");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    // Validate email domain exists via DNS MX lookup
    const emailValidation = await validateEmailDomain(data.email);
    if (!emailValidation.valid) {
      toast.error(emailValidation.error || "Invalid email domain");
      setIsLoading(false);
      return;
    }

    // Check if email is already registered
    const emailAvailable = await checkEmailAvailable(data.email);
    if (!emailAvailable.available) {
      toast.error(emailAvailable.error || "Email already in use");
      setIsLoading(false);
      return;
    }

    // Check if username is already taken
    const usernameAvailable = await checkUsernameAvailable(data.username);
    if (!usernameAvailable.available) {
      toast.error(usernameAvailable.error || "Username already taken");
      setIsLoading(false);
      return;
    }

    const result = await signUp.email({
      email: data.email,
      password: data.password,
      name: `${data.firstName} ${data.lastName}`,
      username: data.username,
    });

    if (result.error) {
      toast.error(result.error.message || "Registration failed");
      setIsLoading(false);
      return;
    }

    setRegisteredEmail(data.email);
    setVerificationSent(true);
    setIsLoading(false);
  };

  // Show verification sent state
  if (verificationSent) {
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
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600">
              <MailCheckIcon className="size-7 text-white" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription className="pt-2">
              We sent a verification link to
            </CardDescription>
            <p className="font-medium text-foreground">{registeredEmail}</p>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-sm text-muted-foreground">
              Click the link in the email to verify your account and join the
              hardstyle community. The link will expire in 24 hours.
            </p>
            <p className="text-sm text-muted-foreground">
              Already verified?{" "}
              <Link
                href="/login"
                className="font-medium text-red-500 hover:text-red-400"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join the hardstyle community today</CardDescription>
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  {...register("firstName")}
                  aria-invalid={!!errors.firstName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  {...register("lastName")}
                  aria-invalid={!!errors.lastName}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="dj_raver"
                {...register("username")}
                aria-invalid={!!errors.username}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="raver@example.com"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                aria-invalid={!!errors.confirmPassword}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsValue}
                  onCheckedChange={(checked) =>
                    setValue("terms", checked === true)
                  }
                  className="mt-1"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm font-normal leading-relaxed"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-red-500 hover:text-red-400"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-red-500 hover:text-red-400"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-red-700"
            >
              {isLoading && (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              )}
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-red-500 hover:text-red-400"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
