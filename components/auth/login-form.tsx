"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserRole } from "@/types/database";
import { AuthFormGlow } from "@/components/auth/auth-form-glow";
import { DemoAccountsPanel } from "@/components/auth/demo-accounts-panel";
import { Loader2, LogIn } from "lucide-react";

function getDashboardPath(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    student: "/student/dashboard",
    staff: "/staff/dashboard",
    lecturer: "/lecturer/dashboard",
    admin: "/admin/dashboard",
  };
  return paths[role];
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const role = (profile?.role ?? "student") as UserRole;
    router.push(getDashboardPath(role));
    router.refresh();
  }

  return (
    <>
    <AuthFormGlow>
    <Card className="auth-card w-full border-0 shadow-2xl shadow-uptm-blue/10 dark:shadow-black/40">
      <CardHeader className="space-y-2 px-8 pb-2 pt-10 text-center sm:px-10 lg:px-12 lg:pt-12">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 lg:h-16 lg:w-16">
          <LogIn className="h-7 w-7 text-primary lg:h-8 lg:w-8" />
        </div>
        <CardTitle className="text-2xl text-foreground sm:text-3xl">Welcome Back</CardTitle>
        <CardDescription className="text-base">Sign in to your SURS account</CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-10 sm:px-10 lg:px-12 lg:pb-12">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm lg:text-base">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="student@uptm.edu.my"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 transition-shadow focus:shadow-md focus:shadow-uptm-blue/10 lg:h-[3.25rem]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm lg:text-base">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 transition-shadow focus:shadow-md focus:shadow-uptm-blue/10 lg:h-[3.25rem]"
            />
          </div>
          <Button type="submit" className="h-12 w-full text-base lg:h-[3.25rem] lg:text-lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link href="/reset-password" className="font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="mt-2 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </div>
      </CardContent>
    </Card>
    </AuthFormGlow>
    <DemoAccountsPanel
      onSelect={(demoEmail, demoPassword) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
        setError("");
      }}
    />
    </>
  );
}
