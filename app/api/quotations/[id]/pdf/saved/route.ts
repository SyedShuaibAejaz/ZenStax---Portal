import { NextResponse } from "next/server";

import { buildPdfFileName } from "@/lib/pdf/file-name";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  const { id } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { data: quotation, error } = await supabase
    .from("quotations")
    .select("pdf_path, quotation_number, clients (name, company_name)")
    .eq("id", id)
    .single();

  if (error || !quotation?.pdf_path) {
    return NextResponse.json(
      { error: "Saved PDF not found." },
      { status: 404 },
    );
  }

  const { data: signedFile, error: signedUrlError } =
    await supabase.storage
      .from("zenstax-private")
      .createSignedUrl(quotation.pdf_path, 60 * 10, {
        download: buildPdfFileName(quotation.quotation_number, quotation.clients, "Quotation"),
      });

  if (signedUrlError || !signedFile?.signedUrl) {
    return NextResponse.json(
      {
        error:
          signedUrlError?.message ??
          "Could not create download URL.",
      },
      { status: 500 },
    );
  }

  return NextResponse.redirect(signedFile.signedUrl);
}