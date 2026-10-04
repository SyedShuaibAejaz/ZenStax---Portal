import { Suspense } from "react";

import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#071B31]" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
