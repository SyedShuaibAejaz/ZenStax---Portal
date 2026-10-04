import { NextResponse } from "next/server";

import { emailTransporter } from "@/lib/email/transporter";
import {
  canEditSettings,
  getCurrentWorkspace,
} from "@/lib/workspace/get-current-workspace";

// Owner/admin only: this endpoint reveals SMTP connection errors.
export async function GET() {
  const workspace = await getCurrentWorkspace();

  if (!workspace || !canEditSettings(workspace.role)) {
    return NextResponse.json(
      { success: false, error: "Forbidden." },
      { status: 403 },
    );
  }

  try {
    await emailTransporter.verify();

    return NextResponse.json({
      success: true,
      message: "SMTP connection verified.",
    });
  } catch (error) {
    console.error("SMTP verification failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "SMTP verification failed.",
      },
      { status: 500 },
    );
  }
}
