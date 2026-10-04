"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(searchParams.get("error") ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/set-password`,
      },
    );

    setLoading(false);

    // Rate limits are the only error worth showing. Anything else gets the
    // same message so the page doesn't reveal which emails have accounts.
    if (resetError && resetError.status === 429) {
      setError("Too many requests. Wait a minute and try again.");
      return;
    }

    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#071B31] px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Image
            src="/Zenstax-LOGO.jpg"
            alt="ZenStax"
            width={64}
            height={64}
            priority
            className="h-16 w-16 object-contain"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-10">
          {sent ? (
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#FF7425]">
                Check your inbox
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-[#071B31]">
                Reset link sent
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                If an account exists for{" "}
                <span className="font-medium text-[#071B31]">{email}</span>, you
                will receive an email with a link to set a new password. The link
                expires in 1 hour. Open it in this same browser.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#FF7425]">
                  Forgot password
                </p>
                <h1 className="text-2xl font-semibold tracking-tight text-[#071B31]">
                  Reset your password
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Enter the email you sign in with and we&apos;ll send you a reset
                  link.
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
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
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="you@company.com"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[#071B31] outline-none transition placeholder:text-slate-400 focus:border-[#FF7425] focus:bg-white focus:ring-4 focus:ring-[#FF7425]/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#FF7425] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#FF7425]/20 transition hover:bg-[#E85E17] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </>
          )}

          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-[#E85E17] hover:text-[#FF7425]"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
