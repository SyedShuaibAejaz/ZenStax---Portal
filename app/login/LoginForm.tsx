"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const invitedEmail =
    searchParams.get("email") ?? "";

  const isInvitation =
    searchParams.get("invite") === "1";

  const [email, setEmail] =
    useState(invitedEmail);

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const supabase = createClient();

    const {
      error: loginError,
    } =
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

    if (loginError) {
      setError(
        "The email or password is incorrect.",
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#071B31]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-[#071B31] via-[#0B2945] to-[#123D5C]" />

          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#FF7425]/20 blur-3xl" />

          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-[#2B83BA]/20 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-16">
            <Image
              src="/Zenstax-LOGO.jpg"
              alt="ZenStax"
              width={200}
              height={70}
              priority
              className="h-14 w-auto object-contain object-left"
            />

            <div className="max-w-xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-[#FF9A63]">
                Business operations, simplified
              </p>

              <h1 className="text-5xl font-semibold leading-tight text-white">
                Everything your business needs,
                <span className="text-[#FF7425]">
                  {" "}
                  in one place.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-lg leading-8 text-slate-300">
                Manage your finances, teams,
                workflows, and business performance
                through one secure ZenStax portal.
              </p>

              <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-semibold text-white">
                    01
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Centralized
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-semibold text-white">
                    02
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Secure
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-semibold text-white">
                    03
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Scalable
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} ZenStax.
              All rights reserved.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center bg-[#F7F9FC] px-5 py-12 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <Image
                src="/Zenstax-LOGO.jpg"
                alt="ZenStax"
                width={190}
                height={64}
                priority
                className="h-14 w-auto object-contain"
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_24px_80px_rgba(7,27,49,0.12)] sm:p-10">
              <div className="mb-8">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#FF7425]">
                  Welcome back
                </p>

                <h2 className="text-3xl font-semibold tracking-tight text-[#071B31]">
                  Sign in to ZenStax
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Access your business portal securely.
                </p>
              </div>

              {isInvitation && (
                <div className="mb-6 rounded-2xl border border-[#FFD8C5] bg-[#FFF5EF] p-4 text-sm leading-6 text-[#9A431D]">
                  Your invitation is ready. Create
                  your password from the invitation
                  email, then sign in here.
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#071B31]"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    autoComplete="email"
                    placeholder="you@company.com"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[#071B31] outline-none transition placeholder:text-slate-400 focus:border-[#FF7425] focus:bg-white focus:ring-4 focus:ring-[#FF7425]/10"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-[#071B31]"
                    >
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-[#E85E17] hover:text-[#FF7425]"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="current-password"
                    placeholder="Enter your password"
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
                    ? "Signing in..."
                    : "Sign in"}
                </button>
              </form>

              <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                <p className="text-xs leading-5 text-slate-400">
                  Access is provided by your ZenStax
                  workspace administrator.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}