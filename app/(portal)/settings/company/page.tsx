import { redirect } from "next/navigation";

// Company details now live on /settings and are saved to company_settings.
export default function CompanySettingsPage() {
  redirect("/settings");
}
