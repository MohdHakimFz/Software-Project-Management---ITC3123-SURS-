"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Programme, ProgrammeLevel } from "@/types/database";
import { Loader2, UserPlus } from "lucide-react";

const LEVEL_ORDER: ProgrammeLevel[] = ["foundation", "diploma", "bachelor", "professional", "postgraduate"];

const LEVEL_LABELS: Record<ProgrammeLevel, string> = {
  foundation: "Foundation",
  diploma: "Diploma",
  bachelor: "Bachelor Degree",
  professional: "Professional",
  postgraduate: "Master / Postgraduate",
};

export function RegisterForm() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<ProgrammeLevel | "">("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    programme_id: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProgrammes() {
      const supabase = createClient();
      const { data, error: loadError } = await supabase
        .from("programmes")
        .select("*, faculties(code, name)")
        .eq("is_active", true)
        .order("level")
        .order("code");

      if (loadError) {
        setError("Failed to load programmes. Please refresh the page.");
        return;
      }
      setProgrammes(data ?? []);
    }
    loadProgrammes();
  }, []);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleLevelChange(level: ProgrammeLevel) {
    setSelectedLevel(level);
    setForm((prev) => ({ ...prev, programme_id: "" }));
  }

  const availableLevels = LEVEL_ORDER.filter((level) =>
    programmes.some((p) => p.level === level)
  );

  const programmesForLevel = selectedLevel
    ? programmes.filter((p) => p.level === selectedLevel)
    : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!selectedLevel) {
      setError("Please select an education level");
      return;
    }
    if (!form.programme_id) {
      setError("Please select a programme");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const studentId = `UPTM${new Date().getFullYear()}${String(Math.floor(Math.random() * 900) + 100)}`;

    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          role: "student",
          programme_id: form.programme_id,
          phone: form.phone || null,
          student_id: studentId,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <Card className="auth-card w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-foreground">Registration Successful!</CardTitle>
          <CardDescription>
            Please check your email to verify your account, then login.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild className="w-full">
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="auth-card w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl text-foreground">Student Registration</CardTitle>
        <CardDescription>Create your SURS account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => updateField("full_name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="education_level">Education Level</Label>
            <Select
              value={selectedLevel || undefined}
              onValueChange={(v) => handleLevelChange(v as ProgrammeLevel)}
            >
              <SelectTrigger id="education_level">
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                {availableLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {LEVEL_LABELS[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="programme">Programme</Label>
            <Select
              value={form.programme_id || undefined}
              onValueChange={(v) => updateField("programme_id", v)}
              disabled={!selectedLevel}
            >
              <SelectTrigger id="programme">
                <SelectValue
                  placeholder={
                    selectedLevel ? "Select programme" : "Select education level first"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {programmesForLevel.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.code} — {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <Input
              id="confirm_password"
              type="password"
              value={form.confirm_password}
              onChange={(e) => updateField("confirm_password", e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
