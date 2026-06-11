"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile, Programme, ProgrammeLevel } from "@/types/database";
import { Loader2, Save, Lock, User, Info } from "lucide-react";

const LEVEL_LABELS: Record<ProgrammeLevel, string> = {
  foundation: "Foundation",
  diploma: "Diploma",
  bachelor: "Bachelor Degree",
  professional: "Professional",
  postgraduate: "Master / Postgraduate",
};

interface ProfileSettingsFormProps {
  profile: Profile;
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const router = useRouter();
  const isStudent = profile.role === "student";
  const programme = profile.programmes as Programme | undefined;
  const programmeLevel = programme?.level;

  const [profileForm, setProfileForm] = useState({
    full_name: profile.full_name,
    phone: profile.phone ?? "",
  });
  const [passwordForm, setPasswordForm] = useState({
    new_password: "",
    confirm_password: "",
  });

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    setProfileForm({
      full_name: profile.full_name,
      phone: profile.phone ?? "",
    });
  }, [profile.full_name, profile.phone]);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!profileForm.full_name.trim()) {
      setProfileError("Full name is required");
      return;
    }

    setProfileLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileForm.full_name.trim(),
        phone: profileForm.phone.trim() || null,
      })
      .eq("id", profile.id);

    if (error) {
      setProfileError(error.message);
      setProfileLoading(false);
      return;
    }

    setProfileSuccess("Profile updated successfully.");
    setProfileLoading(false);
    router.refresh();
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.new_password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.new_password,
    });

    if (error) {
      setPasswordError(error.message);
      setPasswordLoading(false);
      return;
    }

    setPasswordSuccess("Password updated successfully.");
    setPasswordForm({ new_password: "", confirm_password: "" });
    setPasswordLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {profileError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                {profileSuccess}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  disabled
                  className="bg-muted capitalize"
                />
              </div>
            </div>

            {isStudent && profile.student_id && (
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID</Label>
                <Input id="student_id" value={profile.student_id} disabled className="bg-muted" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, full_name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+60 12-345 6789"
                value={profileForm.phone}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            {isStudent && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="education_level">Education Level</Label>
                  <Input
                    id="education_level"
                    value={
                      programmeLevel ? LEVEL_LABELS[programmeLevel as ProgrammeLevel] : "Not assigned"
                    }
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="programme">Programme</Label>
                  <Input
                    id="programme"
                    value={
                      programme
                        ? `${programme.code} — ${programme.name}`
                        : "Not assigned"
                    }
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="flex gap-3 rounded-lg border border-sky-200 bg-sky-50/80 p-4 dark:border-sky-900 dark:bg-sky-950/30">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                  <p className="text-sm text-muted-foreground">
                    Programme is locked after registration. To request a programme change, please
                    contact the admin or registrar office.
                  </p>
                </div>
              </>
            )}

            <Button type="submit" disabled={profileLoading}>
              {profileLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your login password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                {passwordSuccess}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, new_password: e.target.value }))
                }
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, confirm_password: e.target.value }))
                }
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" variant="outline" disabled={passwordLoading}>
              {passwordLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
