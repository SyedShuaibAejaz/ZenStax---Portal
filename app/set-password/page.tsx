"use client";

import Image from "next/image";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type RecoveryParams = {
  access_token: string;
  refresh_token: string;
};

export default function SetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [ready, setReady] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    const supabase = createClient();

    let mounted = true;

    async function initializeRecoverySession() {
      try {
        const hash =
          window.location.hash.substring(1);

        const hashParams =
          new URLSearchParams(hash);

        const accessToken =
          hashParams.get("access_token");

        const refreshToken =
          hashParams.get("refresh_token");

        const recoveryType =
          hashParams.get("type");

        /*
         * Supabase recovery links usually arrive as:
         *
         * /set-password#access_token=...
         * &refresh_token=...
         * &type=recovery
         */
        if (
          !accessToken ||
          !refreshToken
        ) {
          const {
            data: {
              session,
            },
          } =
            await supabase.auth.getSession();

          if (!mounted) {
            return;
          }

          if (session) {
            setReady(true);
          } else {
            setError(
              "This password setup link is invalid or has expired.",
            );
          }

          setCheckingSession(false);
          return;
        }

        if (
          recoveryType &&
          recoveryType !== "recovery"
        ) {
          setError(
            "This link is not a valid password setup link.",
          );
          setCheckingSession(false);
          return;
        }

        const {
          data: sessionData,
          error: sessionError,
        } =
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

        if (!mounted) {
          return;
        }

        if (
          sessionError ||
          !sessionData.session
        ) {
          console.error(
            "Recovery session failed:",
            sessionError,
          );

          setError(
            sessionError?.message ??
              "This password setup link is invalid or has expired.",
          );

          setCheckingSession(false);
          return;
        }

        /*
         * Remove the tokens from the visible URL
         * after Supabase stores the session.
         */
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );

        setReady(true);
        setCheckingSession(false);
      } catch (sessionError) {
        console.error(
          "Recovery initialization failed:",
          sessionError,
        );

        if (!mounted) {
          return;
        }

        setError(
          "This password setup link is invalid or has expired.",
        );
        setCheckingSession(false);
      }
    }

    initializeRecoverySession();

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (event, session) => {
          if (
            event === "PASSWORD_RECOVERY" &&
            session
          ) {
            setReady(true);
            setCheckingSession(false);
            setError("");
          }
        },
      );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleSetPassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!ready) {
      setError(
        "Your password setup session is not ready. Please open the latest invitation email again.",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "The passwords do not match.",
      );
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const {
      error: updateError,
    } =
      await supabase.auth.updateUser({
        password,
      });

    if (updateError) {
      console.error(
        "Password update failed:",
        updateError,
      );

      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(
      "Your password has been created successfully.",
    );

    await supabase.auth.signOut();

    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1500);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#071B31] px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Image
            src="/Zenstax-LOGO.jpg"
            alt="ZenStax"
            width={200}
            height={70}
            priority
            className="h-14 w-auto object-contain"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl sm:p-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#FF7425]">
            Workspace invitation
          </p>

          <h1 className="text-3xl font-semibold text-[#071B31]">
            Create your password
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Choose a secure password for your ZenStax
            account.
          </p>

          {checkingSession && (
            <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Verifying your invitation link...
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700">
              {success}
            </div>
          )}

          {!checkingSession &&
            ready &&
            !success && (
              <form
                onSubmit={handleSetPassword}
                className="mt-8 space-y-5"
              >
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[#071B31]"
                  >
                    New password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[#071B31] outline-none transition placeholder:text-slate-400 focus:border-[#FF7425] focus:bg-white focus:ring-4 focus:ring-[#FF7425]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-[#071B31]"
                  >
                    Confirm password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    minLength={8}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[#071B31] outline-none transition placeholder:text-slate-400 focus:border-[#FF7425] focus:bg-white focus:ring-4 focus:ring-[#FF7425]/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#FF7425] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#FF7425]/20 transition hover:bg-[#E85E17] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Saving password..."
                    : "Create password"}
                </button>
              </form>
            )}
        </div>
      </div>
    </main>
  );
}