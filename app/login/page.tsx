import { Suspense } from "react";
import LoginForm from "./LoginForm"; 

function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#071B31] px-5">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#FF7425]" />
        <p className="text-sm text-slate-300">
          Loading ZenStax...
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}