import { redirect } from "next/navigation";

// Branding (logo, colours) is read from /public and the PDF templates,
// so there is nothing to configure here.
export default function BrandingSettingsPage() {
  redirect("/settings");
}
