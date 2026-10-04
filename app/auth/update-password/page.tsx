import { redirect } from "next/navigation";

// Legacy starter-kit route; the portal uses /set-password.
export default function Page() {
  redirect("/set-password");
}
