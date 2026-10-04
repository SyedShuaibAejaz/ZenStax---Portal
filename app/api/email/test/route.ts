import { NextResponse } from "next/server";

import { emailTransporter } from "@/lib/email/transporter";

export async function GET() {
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