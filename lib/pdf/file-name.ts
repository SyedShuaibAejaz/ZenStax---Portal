type ClientLike =
  | { name?: string | null; company_name?: string | null }
  | { name?: string | null; company_name?: string | null }[]
  | null
  | undefined;

export type PdfDocumentType = "Quotation" | "Invoice" | "Credit Note";

function clientDisplayName(client: ClientLike) {
  const value = Array.isArray(client) ? client[0] : client;
  return value?.company_name?.trim() || value?.name?.trim() || "";
}

function clean(part: string) {
  return part
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

/**
 * "ZEN-INV-0001 - Acme Trading LLC - Invoice.pdf"
 * The number comes first so files sort in order in any folder.
 */
export function buildPdfFileName(
  documentNumber: string,
  client: ClientLike,
  type: PdfDocumentType,
) {
  const parts = [clean(documentNumber), clean(clientDisplayName(client)), type]
    .filter(Boolean);

  return `${parts.join(" - ")}.pdf`;
}

/** Content-Disposition that also keeps Arabic / non-ASCII client names intact. */
export function attachmentHeader(fileName: string) {
  const ascii = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
