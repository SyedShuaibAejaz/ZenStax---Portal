import { redirect } from "next/navigation";

// Legacy starter-kit route; the portal uses /forgot-password.
export default function Page() {
  redirect("/forgot-password");
}
