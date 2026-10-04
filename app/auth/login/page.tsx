import { redirect } from "next/navigation";

// Legacy starter-kit route; the portal uses /login.
export default function Page() {
  redirect("/login");
}
