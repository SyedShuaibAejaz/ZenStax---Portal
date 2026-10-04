"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AcceptInvitePage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [isChecking, setIsChecking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkInviteSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (!session) {
        setError(
          "This invitation link is invalid or has expired. Please request a new invitation.",
        );
      }

      setIsChecking(false);
    }

    checkInviteSession();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSaving(true);

    const { error: updateError } =
      await supabase.auth.updateUser({
        password,
      });

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          Checking invitation...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            ZenStax workspace
          </p>

          <h1 className="mt-1 text-2xl font-semibold">
            Accept invitation
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Create a password to access the business portal.
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid gap-2">
              <Label htmlFor="password">
                New password
              </Label>

              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                minLength={8}
                required
                disabled={isSaving}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">
                Confirm password
              </Label>

              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                minLength={8}
                required
                disabled={isSaving}
              />
            </div>

            <Button
              type="submit"
              disabled={isSaving}
              className="w-full bg-zen-orange text-white hover:bg-orange-600"
            >
              {isSaving
                ? "Creating account..."
                : "Accept invitation"}
            </Button>
          </form>
        )}

        {error && (
          <Button
            type="button"
            variant="outline"
            className="mt-5 w-full"
            onClick={() => router.push("/login")}
          >
            Return to login
          </Button>
        )}
      </div>
    </main>
  );
}