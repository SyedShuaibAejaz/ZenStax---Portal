import fs from "node:fs";
import path from "node:path";

import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

export type InvoicePdfClient = {
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  trn: string | null;
};

export type InvoicePdfItem = {
  id: string;
  description: string;
  quantity: number | string;
  unit_price: number | string;
  vat_rate: number | string;
  line_total: number | string;
  custom_values?: Record<string, string> | null;
};

export type InvoicePdfCustomColumn = {
  key: string;
  label: string;
};

export type InvoicePdfBusiness = {
  business_name: string;
  legal_name?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  trn?: string | null;
  bank_details?: string | null;
  terms_and_conditions?: string | null;
};

export type InvoicePdfData = {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string | null;
  status: string;
  currency: string;
  subtotal: number | string;
  discount: number | string;
  vat_amount: number | string;
  total: number | string;
  amount_paid: number | string;
  credited_amount?: number | string | null;
  notes: string | null;
  custom_columns?: InvoicePdfCustomColumn[] | null;
  clients: InvoicePdfClient | InvoicePdfClient[] | null;
  invoice_items: InvoicePdfItem[];
  business?: InvoicePdfBusiness;
  /** Set when this document is a tax credit note rather than an invoice. */
  credit_note?: {
    reason: string;
    original_invoice_number: string;
    original_issue_date: string;
  } | null;
};

/* ---------- Assets (logo + font) ---------- */

const PUBLIC_DIR = path.join(process.cwd(), "public");
const FONT_SEMIBOLD = path.join(PUBLIC_DIR, "fonts", "Montserrat-SemiBold.ttf");
const FONT_BOLD = path.join(PUBLIC_DIR, "fonts", "Montserrat-Bold.ttf");

// Set to false if your logo image already contains the "ZenStax" name.
const SHOW_BRAND_TEXT = true;

type LogoSource = { data: Buffer; format: "png" | "jpg" };

function loadLogo(): LogoSource | null {
  let files: string[] = [];

  try {
    files = fs.readdirSync(PUBLIC_DIR);
  } catch {
    console.warn("Could not read the /public folder:", PUBLIC_DIR);
    return null;
  }

  const logoFile = files.find((name) =>
    /logo\.(png|jpe?g)$/i.test(name),
  );

  if (!logoFile) {
    console.warn(
      "No logo found in /public. Expected a file ending in logo.png, logo.jpg or logo.jpeg.",
    );
    return null;
  }

  const data = fs.readFileSync(path.join(PUBLIC_DIR, logoFile));
  const header = data.subarray(0, 4).toString("hex");

  if (header === "89504e47") {
    return { data, format: "png" };
  }

  if (header.startsWith("ffd8")) {
    return { data, format: "jpg" };
  }

  console.warn(
    `"${logoFile}" is not a real PNG/JPG file. SVG and WebP are not supported.`,
  );

  return null;
}

const logo = loadLogo();
const hasLogo = logo !== null;

const hasHeadingFont =
  fs.existsSync(FONT_SEMIBOLD) && fs.existsSync(FONT_BOLD);

if (hasHeadingFont) {
  Font.register({
    family: "Montserrat",
    fonts: [
      { src: FONT_SEMIBOLD, fontWeight: 600 },
      { src: FONT_BOLD, fontWeight: 700 },
    ],
  });
}

const headingFont = hasHeadingFont ? "Montserrat" : "Helvetica-Bold";
const headingBold = hasHeadingFont ? { fontWeight: 700 as const } : {};
const headingSemi = hasHeadingFont ? { fontWeight: 600 as const } : {};

/* ---------- Design tokens ---------- */

const colors = {
  navy: "#071B31",
  navySoft: "#12304D",
  orange: "#E85D04",
  orangeLight: "#FF8A3D",
  text: "#071B31",
  muted: "#526579",
  lightMuted: "#708197",
  border: "#D9E2EC",
  tableBackground: "#F4F7FA",
  softBackground: "#F7F9FC",
  success: "#15803D",
  white: "#FFFFFF",
  footerText: "#B8C4D2",
};

const HEADER_PAD = 128;
const FOOTER_PAD = 84;

const styles = StyleSheet.create({
  page: {
    paddingTop: HEADER_PAD,
    paddingBottom: FOOTER_PAD,
    paddingHorizontal: 40,
    fontSize: 10,
    color: colors.text,
    fontFamily: "Helvetica",
  },

  /* Header */
  headerBand: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.navy,
  },

  headerInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 40,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoBox: {
    width: 56,
    height: 54,
    marginRight: 16,
    borderRadius: 6,
    backgroundColor: "#03304F",
    overflow: "hidden",
  },

  logo: {
    position: "absolute",
    top: -10.8,
    left: -6.9,
    width: 72,
    height: 72,
  },

  brandName: {
    fontFamily: headingFont,
    ...headingBold,
    fontSize: 24,
    color: colors.white,
    letterSpacing: 0.5,
  },

  brandAccent: {
    color: colors.orange,
  },

  brandSubtitle: {
    marginTop: 4,
    fontSize: 8.5,
    color: colors.footerText,
    letterSpacing: 0.3,
  },

  titleBlock: {
    alignItems: "flex-end",
  },

  invoiceTitle: {
    fontFamily: headingFont,
    ...headingBold,
    fontSize: 22,
    color: colors.white,
    letterSpacing: 2.5,
    textAlign: "right",
  },

  titleMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  statusBadge: {
    marginRight: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.orangeLight,
  },

  statusText: {
    fontFamily: headingFont,
    ...headingSemi,
    fontSize: 8,
    color: colors.orangeLight,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  invoiceNumber: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    backgroundColor: colors.orange,
    borderRadius: 3,
    fontFamily: headingFont,
    ...headingSemi,
    fontSize: 9.5,
    color: colors.white,
    letterSpacing: 0.8,
  },

  stripeRow: {
    flexDirection: "row",
    height: 5,
  },

  stripeOrange: {
    width: "34%",
    backgroundColor: colors.orange,
  },

  stripeLight: {
    width: "10%",
    backgroundColor: colors.orangeLight,
  },

  stripeSoft: {
    width: "56%",
    backgroundColor: colors.navySoft,
  },

  /* Info row */
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 26,
  },

  fromColumn: {
    width: "29%",
  },

  billColumn: {
    width: "29%",
  },

  detailsColumn: {
    width: "36%",
    padding: 12,
    backgroundColor: colors.softBackground,
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
  },

  sectionLabel: {
    marginBottom: 7,
    fontFamily: headingFont,
    ...headingSemi,
    fontSize: 8,
    color: colors.orange,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  partyName: {
    marginBottom: 5,
    fontFamily: headingFont,
    ...headingBold,
    fontSize: 11,
    color: colors.text,
  },

  infoText: {
    marginBottom: 4,
    fontSize: 9,
    lineHeight: 1.35,
    color: colors.muted,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  detailLabel: {
    fontSize: 9,
    color: colors.muted,
  },

  detailValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.text,
  },

  /* Table */
  table: {
    width: "100%",
    marginTop: 4,
  },

  tableHeader: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 8,
    backgroundColor: colors.navy,
  },

  tableHeaderText: {
    fontFamily: headingFont,
    ...headingSemi,
    fontSize: 8,
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  tableRowAlternate: {
    backgroundColor: colors.tableBackground,
  },

  right: {
    textAlign: "right",
  },

  tableCell: {
    fontSize: 9,
    color: colors.text,
    lineHeight: 1.3,
  },

  /* Totals */
  summarySection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 22,
  },

  summaryBox: {
    width: 235,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  summaryLabel: {
    fontSize: 9.5,
    color: colors.muted,
  },

  summaryValue: {
    fontSize: 9.5,
    color: colors.text,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: colors.orange,
  },

  totalLabel: {
    fontFamily: headingFont,
    ...headingBold,
    fontSize: 13,
    color: colors.navy,
  },

  totalValue: {
    fontFamily: headingFont,
    ...headingBold,
    fontSize: 13,
    color: colors.orange,
  },

  paymentSummary: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
  },

  paymentSummaryBox: {
    width: 235,
    padding: 10,
    borderRadius: 4,
    backgroundColor: "#F0FDF4",
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },

  paymentLabel: {
    fontSize: 9,
    color: colors.muted,
  },

  paidValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.success,
  },

  dueValue: {
    fontFamily: headingFont,
    ...headingBold,
    fontSize: 10,
    color: colors.orange,
  },

  /* Notes, bank, terms */
  notesSection: {
    marginTop: 28,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  notesText: {
    fontSize: 9,
    lineHeight: 1.45,
    color: colors.muted,
  },

  bankSection: {
    marginTop: 18,
    padding: 12,
    borderRadius: 4,
    backgroundColor: colors.tableBackground,
    borderLeftWidth: 3,
    borderLeftColor: colors.navy,
  },

  bankText: {
    fontSize: 9,
    lineHeight: 1.45,
    color: colors.muted,
  },

  /* Footer */
  footerBand: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.navy,
  },

  footerStripe: {
    flexDirection: "row",
    height: 4,
  },

  footerStripeSoft: {
    width: "56%",
    backgroundColor: colors.navySoft,
  },

  footerStripeLight: {
    width: "10%",
    backgroundColor: colors.orangeLight,
  },

  footerStripeOrange: {
    width: "34%",
    backgroundColor: colors.orange,
  },

  footerInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 40,
  },

  footerLeft: {
    width: "78%",
  },

  footerBrand: {
    fontFamily: headingFont,
    ...headingBold,
    fontSize: 10,
    color: colors.white,
    letterSpacing: 0.4,
  },

  footerThanks: {
    marginTop: 3,
    fontSize: 7.5,
    color: colors.footerText,
  },

  footerContact: {
    marginTop: 3,
    fontSize: 7.5,
    color: colors.footerText,
  },

  footerPage: {
    fontFamily: headingFont,
    ...headingSemi,
    fontSize: 8,
    color: colors.orangeLight,
    letterSpacing: 0.6,
  },
});

/* ---------- Helpers ---------- */

function numberValue(
  value: number | string | null | undefined,
) {
  return Number(value ?? 0).toFixed(2);
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-AE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getClient(clients: InvoicePdfData["clients"]) {
  if (Array.isArray(clients)) {
    return clients[0] ?? null;
  }

  return clients;
}

function getStatusText(status: string) {
  return status.replaceAll("_", " ");
}

function parseCustomColumns(
  value: InvoicePdfData["custom_columns"],
): InvoicePdfCustomColumn[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (column) =>
        column &&
        typeof column.key === "string" &&
        typeof column.label === "string" &&
        column.label.trim() !== "",
    )
    .slice(0, 4);
}

function getCustomValue(
  values: InvoicePdfItem["custom_values"],
  key: string,
) {
  const cell = values?.[key];

  return cell === undefined || cell === null || String(cell).trim() === ""
    ? "—"
    : String(cell);
}

// Widths in %. With no extra columns the original invoice layout is kept.
function getColumnWidths(customCount: number) {
  if (customCount === 0) {
    return {
      description: 39,
      custom: 0,
      qty: 12,
      unitPrice: 19,
      vat: 11,
      amount: 19,
    };
  }

  const qty = 7;
  const unitPrice = 14;
  const vat = 7;
  const amount = 14;
  const fixed = qty + unitPrice + vat + amount;

  const custom =
    customCount <= 2 ? 14 : customCount === 3 ? 12 : 10;

  return {
    description: 100 - fixed - custom * customCount,
    custom,
    qty,
    unitPrice,
    vat,
    amount,
  };
}

/* ---------- Document ---------- */

export function InvoiceDocument({
  data,
}: {
  data: InvoicePdfData;
}) {
  const client = getClient(data.clients);

  const business: InvoicePdfBusiness = data.business ?? {
    business_name: "ZenStax",
    legal_name: null,
    address: null,
    email: null,
    phone: null,
    website: null,
    trn: null,
    bank_details: null,
    terms_and_conditions: null,
  };

  const creditNote = data.credit_note ?? null;
  const isCreditNote = creditNote !== null;
  const total = Number(data.total ?? 0);
  const amountPaid = Number(data.amount_paid ?? 0);
  const credited = Number(data.credited_amount ?? 0);
  const amountDue = Math.max(total - credited - amountPaid, 0);

  const showBrandText = SHOW_BRAND_TEXT || !hasLogo;

  const customColumns = parseCustomColumns(data.custom_columns);
  const widths = getColumnWidths(customColumns.length);
  const compact = customColumns.length >= 3;
  const cellFont = compact ? 8 : 9;
  const headerFont = compact ? 7 : 8;

  const col = (width: number) => ({ width: `${width}%` });

  const contactLine = [
    business.email,
    business.phone,
    business.website,
    business.trn ? `TRN ${business.trn}` : null,
  ]
    .filter(Boolean)
    .join("   |   ");

  return (
    <Document
      title={`${isCreditNote ? "Credit Note" : "Invoice"} ${data.invoice_number}`}
      author={business.business_name}
      subject={`${business.business_name} invoice`}
    >
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.headerBand} fixed>
          <View style={styles.headerInner}>
            <View style={styles.brandRow}>
              {logo && (
                <View style={styles.logoBox}>
                  <Image src={logo} style={styles.logo} />
                </View>
              )}

              {showBrandText && (
                <View>
                  <Text style={styles.brandName}>
                    Zen<Text style={styles.brandAccent}>Stax</Text>
                  </Text>

                  <Text style={styles.brandSubtitle}>
                    Technology solutions for modern businesses
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.titleBlock}>
              <Text style={styles.invoiceTitle}>
                {isCreditNote ? "TAX CREDIT NOTE" : "TAX INVOICE"}
              </Text>

              <View style={styles.titleMetaRow}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {getStatusText(data.status)}
                  </Text>
                </View>

                <Text style={styles.invoiceNumber}>
                  {data.invoice_number}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.stripeRow}>
            <View style={styles.stripeOrange} />
            <View style={styles.stripeLight} />
            <View style={styles.stripeSoft} />
          </View>
        </View>

        {/* From / Bill to / Details */}
        <View style={styles.infoGrid}>
          <View style={styles.fromColumn}>
            <Text style={styles.sectionLabel}>From</Text>

            <Text style={styles.partyName}>
              {business.legal_name || business.business_name}
            </Text>

            {business.address && (
              <Text style={styles.infoText}>{business.address}</Text>
            )}

            {business.email && (
              <Text style={styles.infoText}>{business.email}</Text>
            )}

            {business.phone && (
              <Text style={styles.infoText}>{business.phone}</Text>
            )}

            {business.trn && (
              <Text style={styles.infoText}>TRN: {business.trn}</Text>
            )}
          </View>

          <View style={styles.billColumn}>
            <Text style={styles.sectionLabel}>Bill to</Text>

            <Text style={styles.partyName}>
              {client?.company_name ||
                client?.name ||
                "Unknown client"}
            </Text>

            {client?.company_name && (
              <Text style={styles.infoText}>
                Contact: {client.name}
              </Text>
            )}

            {client?.email && (
              <Text style={styles.infoText}>{client.email}</Text>
            )}

            {client?.phone && (
              <Text style={styles.infoText}>{client.phone}</Text>
            )}

            {client?.address && (
              <Text style={styles.infoText}>{client.address}</Text>
            )}

            {client?.trn && (
              <Text style={styles.infoText}>TRN: {client.trn}</Text>
            )}
          </View>

          <View style={styles.detailsColumn}>
            <Text style={styles.sectionLabel}>
              {isCreditNote ? "Credit note details" : "Invoice details"}
            </Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {isCreditNote ? "Credit note date" : "Invoice date"}
              </Text>
              <Text style={styles.detailValue}>
                {formatDate(data.issue_date)}
              </Text>
            </View>

            {creditNote ? (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Original invoice</Text>
                  <Text style={styles.detailValue}>
                    {creditNote.original_invoice_number}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Invoice date</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(creditNote.original_issue_date)}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Due date</Text>
                <Text style={styles.detailValue}>
                  {formatDate(data.due_date)}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Currency</Text>
              <Text style={styles.detailValue}>{data.currency}</Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text
              style={[
                styles.tableHeaderText,
                col(widths.description),
                { fontSize: headerFont },
              ]}
            >
              Description
            </Text>

            {customColumns.map((column) => (
              <Text
                key={column.key}
                style={[
                  styles.tableHeaderText,
                  col(widths.custom),
                  { fontSize: headerFont },
                ]}
              >
                {column.label}
              </Text>
            ))}

            <Text
              style={[
                styles.tableHeaderText,
                styles.right,
                col(widths.qty),
                { fontSize: headerFont },
              ]}
            >
              Qty
            </Text>

            <Text
              style={[
                styles.tableHeaderText,
                styles.right,
                col(widths.unitPrice),
                { fontSize: headerFont },
              ]}
            >
              Unit price
            </Text>

            <Text
              style={[
                styles.tableHeaderText,
                styles.right,
                col(widths.vat),
                { fontSize: headerFont },
              ]}
            >
              VAT
            </Text>

            <Text
              style={[
                styles.tableHeaderText,
                styles.right,
                col(widths.amount),
                { fontSize: headerFont },
              ]}
            >
              Amount
            </Text>
          </View>

          {data.invoice_items.map((item, index) => (
            <View
              key={item.id}
              wrap={false}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowAlternate : {},
              ]}
            >
              <Text
                style={[
                  styles.tableCell,
                  col(widths.description),
                  { fontSize: cellFont },
                ]}
              >
                {item.description}
              </Text>

              {customColumns.map((column) => (
                <Text
                  key={column.key}
                  style={[
                    styles.tableCell,
                    col(widths.custom),
                    { fontSize: cellFont },
                  ]}
                >
                  {getCustomValue(item.custom_values, column.key)}
                </Text>
              ))}

              <Text
                style={[
                  styles.tableCell,
                  styles.right,
                  col(widths.qty),
                  { fontSize: cellFont },
                ]}
              >
                {numberValue(item.quantity)}
              </Text>

              <Text
                style={[
                  styles.tableCell,
                  styles.right,
                  col(widths.unitPrice),
                  { fontSize: cellFont },
                ]}
              >
                {data.currency} {numberValue(item.unit_price)}
              </Text>

              <Text
                style={[
                  styles.tableCell,
                  styles.right,
                  col(widths.vat),
                  { fontSize: cellFont },
                ]}
              >
                {numberValue(item.vat_rate)}%
              </Text>

              <Text
                style={[
                  styles.tableCell,
                  styles.right,
                  col(widths.amount),
                  { fontSize: cellFont },
                ]}
              >
                {data.currency} {numberValue(item.line_total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.summarySection} wrap={false}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {data.currency} {numberValue(data.subtotal)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>
                {data.currency} {numberValue(data.discount)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>VAT</Text>
              <Text style={styles.summaryValue}>
                {data.currency} {numberValue(data.vat_amount)}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                {isCreditNote ? "Total credited" : "Total"}
              </Text>
              <Text style={styles.totalValue}>
                {data.currency} {numberValue(data.total)}
              </Text>
            </View>
          </View>
        </View>

        {creditNote && (
          <View style={styles.notesSection} wrap={false}>
            <Text style={styles.sectionLabel}>Reason for credit</Text>
            <Text style={styles.notesText}>{creditNote.reason}</Text>
          </View>
        )}

        {!isCreditNote && (
        <View style={styles.paymentSummary} wrap={false}>
          <View style={styles.paymentSummaryBox}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Amount paid</Text>
              <Text style={styles.paidValue}>
                {data.currency} {amountPaid.toFixed(2)}
              </Text>
            </View>

            {credited > 0 && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Credited</Text>
                <Text style={styles.paidValue}>
                  {data.currency} {credited.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Amount due</Text>
              <Text style={styles.dueValue}>
                {data.currency} {amountDue.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        )}

        {data.notes && (
          <View style={styles.notesSection} wrap={false}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {!isCreditNote && business.bank_details && (
          <View style={styles.bankSection} wrap={false}>
            <Text style={styles.sectionLabel}>Payment details</Text>
            <Text style={styles.bankText}>{business.bank_details}</Text>
          </View>
        )}

        {!isCreditNote && business.terms_and_conditions && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionLabel}>
              Terms and conditions
            </Text>
            <Text style={styles.notesText}>
              {business.terms_and_conditions}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footerBand} fixed>
          <View style={styles.footerStripe}>
            <View style={styles.footerStripeSoft} />
            <View style={styles.footerStripeLight} />
            <View style={styles.footerStripeOrange} />
          </View>

          <View style={styles.footerInner}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerBrand}>
                {business.business_name}
              </Text>

              <Text style={styles.footerThanks}>
                Thank you for your business
              </Text>

              {contactLine ? (
                <Text style={styles.footerContact}>{contactLine}</Text>
              ) : null}
            </View>

            <Text
              style={styles.footerPage}
              render={({ pageNumber, totalPages }) =>
                `PAGE ${pageNumber} / ${totalPages}`
              }
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}