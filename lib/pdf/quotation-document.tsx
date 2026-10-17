/* eslint-disable jsx-a11y/alt-text */
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

export type QuotationCustomColumn = {
  key: string;
  label: string;
};

export type QuotationPdfData = {
  quotation_number: string;
  issue_date: string;
  valid_until: string | null;
  currency: string;
  subtotal: number | string;
  discount: number | string;
  vat_amount: number | string;
  total: number | string;
  notes: string | null;
  custom_columns?: QuotationCustomColumn[] | null;
  clients: {
    name: string;
    company_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    trn: string | null;
  } | null;
  quotation_items: {
    id: string;
    description: string;
    quantity: number | string;
    unit_price: number | string;
    vat_rate: number | string;
    line_total: number | string;
    custom_values?: Record<string, string> | null;
  }[];
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

function loadPdfImage(relativePath: string): LogoSource | null {
  const filePath = path.join(PUBLIC_DIR, relativePath);
  try {
    const data = fs.readFileSync(filePath);
    const header = data.subarray(0, 4).toString("hex");
    if (header === "89504e47") return { data, format: "png" };
    if (header.startsWith("ffd8")) return { data, format: "jpg" };
  } catch (error) {
    console.warn(`Could not load PDF image ${relativePath}:`, error);
  }
  return null;
}

const companyStamp = loadPdfImage("branding/company-stamp.png");
const authorizedSignatory = loadPdfImage("branding/authorized-signatory.png");

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
  rowBorder: "#E5EBF0",
  softBackground: "#F7F9FC",
  white: "#FFFFFF",
  footerText: "#B8C4D2",
};

const HEADER_PAD = 128;
const FOOTER_PAD = 78;

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

  brand: {
    fontFamily: headingFont,
    ...headingBold,
    fontSize: 24,
    color: colors.white,
    letterSpacing: 0.5,
  },

  orange: {
    color: colors.orange,
  },

  tagline: {
    marginTop: 4,
    fontSize: 8.5,
    color: colors.footerText,
    letterSpacing: 0.3,
  },

  titleBlock: {
    alignItems: "flex-end",
  },

  title: {
    fontFamily: headingFont,
    ...headingBold,
    fontSize: 22,
    color: colors.white,
    letterSpacing: 2.5,
    textAlign: "right",
  },

  quotationNumber: {
    marginTop: 6,
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

  /* Body */
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 26,
  },

  column: {
    width: "46%",
  },

  label: {
    marginBottom: 7,
    fontFamily: headingFont,
    ...headingSemi,
    fontSize: 8,
    color: colors.orange,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  clientName: {
    marginBottom: 5,
    fontFamily: headingFont,
    ...headingBold,
    fontSize: 12,
    color: colors.text,
  },

  value: {
    marginBottom: 4,
    fontSize: 10,
    lineHeight: 1.35,
  },

  muted: {
    color: colors.muted,
  },

  detailsCard: {
    padding: 12,
    backgroundColor: colors.softBackground,
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
  },

  table: {
    marginTop: 4,
  },

  tableHeader: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 8,
    backgroundColor: colors.navy,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.rowBorder,
  },

  right: {
    textAlign: "right",
  },

  headerText: {
    fontFamily: headingFont,
    ...headingSemi,
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  cellText: {
    lineHeight: 1.35,
  },

  summaryContainer: {
    alignItems: "flex-end",
    marginTop: 24,
  },

  summary: {
    width: 220,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  summaryText: {
    fontSize: 9.5,
    color: colors.muted,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: colors.orange,
  },

  totalText: {
    fontFamily: headingFont,
    ...headingBold,
    fontSize: 13,
    color: colors.navy,
  },

  notes: {
    marginTop: 30,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  notesText: {
    fontSize: 9,
    lineHeight: 1.45,
    color: colors.muted,
  },

  approvalSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
  },
  approvalBlock: {
    width: 210,
    minHeight: 116,
    alignItems: "center",
  },
  approvalArtwork: {
    position: "relative",
    width: 150,
    height: 82,
  },
  stampImage: {
    position: "absolute",
    top: 0,
    left: 35,
    width: 78,
    height: 79,
    objectFit: "contain",
  },
  signatureImage: {
    position: "absolute",
    top: 17,
    left: 3,
    width: 145,
    height: 58,
    objectFit: "contain",
  },
  approvalLine: {
    width: 175,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  approvalLabel: {
    marginTop: 6,
    fontFamily: headingFont,
    ...headingSemi,
    fontSize: 8,
    color: colors.navy,
    textTransform: "uppercase",
    letterSpacing: 0.7,
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

  footerBrand: {
    fontFamily: headingFont,
    ...headingBold,
    fontSize: 10,
    color: colors.white,
    letterSpacing: 0.4,
  },

  footerTagline: {
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

function numberValue(value: number | string | null) {
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

function parseCustomColumns(
  value: QuotationPdfData["custom_columns"],
): QuotationCustomColumn[] {
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

function getColumnWidths(customCount: number) {
  const qty = 7;
  const unitPrice = 14;
  const vat = 7;
  const amount = 14;
  const fixed = qty + unitPrice + vat + amount;

  const custom =
    customCount === 0
      ? 0
      : customCount <= 2
        ? 14
        : customCount === 3
          ? 12
          : 10;

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

export function QuotationDocument({
  data,
}: {
  data: QuotationPdfData;
}) {
  const client = data.clients;
  const showBrandText = SHOW_BRAND_TEXT || !hasLogo;

  const customColumns = parseCustomColumns(data.custom_columns);
  const widths = getColumnWidths(customColumns.length);
  const compact = customColumns.length >= 3;
  const cellFont = compact ? 8 : 9;
  const headerFont = compact ? 7 : 8;

  return (
    <Document
      title={`Quotation ${data.quotation_number}`}
      author="ZenStax"
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
                  <Text style={styles.brand}>
                    Zen<Text style={styles.orange}>Stax</Text>
                  </Text>

                  <Text style={styles.tagline}>
                    Technology solutions for modern businesses
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.titleBlock}>
              <Text style={styles.title}>QUOTATION</Text>

              <Text style={styles.quotationNumber}>
                {data.quotation_number}
              </Text>
            </View>
          </View>

          <View style={styles.stripeRow}>
            <View style={styles.stripeOrange} />
            <View style={styles.stripeLight} />
            <View style={styles.stripeSoft} />
          </View>
        </View>

        {/* Client + details */}
        <View style={styles.infoGrid}>
          <View style={styles.column}>
            <Text style={styles.label}>Prepared for</Text>

            <Text style={styles.clientName}>
              {client?.company_name ||
                client?.name ||
                "Unknown client"}
            </Text>

            {client?.company_name && (
              <Text style={[styles.value, styles.muted]}>
                Contact: {client.name}
              </Text>
            )}

            {client?.email && (
              <Text style={[styles.value, styles.muted]}>
                {client.email}
              </Text>
            )}

            {client?.phone && (
              <Text style={[styles.value, styles.muted]}>
                {client.phone}
              </Text>
            )}

            {client?.address && (
              <Text style={[styles.value, styles.muted]}>
                {client.address}
              </Text>
            )}

            {client?.trn && (
              <Text style={[styles.value, styles.muted]}>
                TRN: {client.trn}
              </Text>
            )}
          </View>

          <View style={[styles.column, styles.detailsCard]}>
            <Text style={styles.label}>Quotation details</Text>

            <Text style={styles.value}>
              Issue date: {formatDate(data.issue_date)}
            </Text>

            <Text style={styles.value}>
              Valid until: {formatDate(data.valid_until)}
            </Text>

            <Text style={styles.value}>
              Currency: {data.currency}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text
              style={[
                styles.headerText,
                { width: `${widths.description}%`, fontSize: headerFont },
              ]}
            >
              Description
            </Text>

            {customColumns.map((column) => (
              <Text
                key={column.key}
                style={[
                  styles.headerText,
                  { width: `${widths.custom}%`, fontSize: headerFont },
                ]}
              >
                {column.label}
              </Text>
            ))}

            <Text
              style={[
                styles.headerText,
                styles.right,
                { width: `${widths.qty}%`, fontSize: headerFont },
              ]}
            >
              Qty
            </Text>

            <Text
              style={[
                styles.headerText,
                styles.right,
                { width: `${widths.unitPrice}%`, fontSize: headerFont },
              ]}
            >
              Unit price
            </Text>

            <Text
              style={[
                styles.headerText,
                styles.right,
                { width: `${widths.vat}%`, fontSize: headerFont },
              ]}
            >
              VAT
            </Text>

            <Text
              style={[
                styles.headerText,
                styles.right,
                { width: `${widths.amount}%`, fontSize: headerFont },
              ]}
            >
              Amount
            </Text>
          </View>

          {data.quotation_items.map((item) => (
            <View key={item.id} style={styles.tableRow} wrap={false}>
              <Text
                style={[
                  styles.cellText,
                  { width: `${widths.description}%`, fontSize: cellFont },
                ]}
              >
                {item.description}
              </Text>

              {customColumns.map((column) => (
                <Text
                  key={column.key}
                  style={[
                    styles.cellText,
                    { width: `${widths.custom}%`, fontSize: cellFont },
                  ]}
                >
                  {item.custom_values?.[column.key] || "—"}
                </Text>
              ))}

              <Text
                style={[
                  styles.cellText,
                  styles.right,
                  { width: `${widths.qty}%`, fontSize: cellFont },
                ]}
              >
                {numberValue(item.quantity)}
              </Text>

              <Text
                style={[
                  styles.cellText,
                  styles.right,
                  { width: `${widths.unitPrice}%`, fontSize: cellFont },
                ]}
              >
                {data.currency} {numberValue(item.unit_price)}
              </Text>

              <Text
                style={[
                  styles.cellText,
                  styles.right,
                  { width: `${widths.vat}%`, fontSize: cellFont },
                ]}
              >
                {numberValue(item.vat_rate)}%
              </Text>

              <Text
                style={[
                  styles.cellText,
                  styles.right,
                  { width: `${widths.amount}%`, fontSize: cellFont },
                ]}
              >
                {data.currency} {numberValue(item.line_total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.summaryContainer} wrap={false}>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Subtotal</Text>
              <Text style={styles.summaryText}>
                {data.currency} {numberValue(data.subtotal)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Discount</Text>
              <Text style={styles.summaryText}>
                {data.currency} {numberValue(data.discount)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>VAT</Text>
              <Text style={styles.summaryText}>
                {data.currency} {numberValue(data.vat_amount)}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalText}>
                {data.currency} {numberValue(data.total)}
              </Text>
            </View>
          </View>
        </View>

        {data.notes && (
          <View style={styles.notes} wrap={false}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {(companyStamp || authorizedSignatory) && (
          <View style={styles.approvalSection} wrap={false}>
            <View style={styles.approvalBlock}>
              <View style={styles.approvalArtwork}>
                {companyStamp && <Image src={companyStamp} style={styles.stampImage} />}
                {authorizedSignatory && <Image src={authorizedSignatory} style={styles.signatureImage} />}
              </View>
              <View style={styles.approvalLine} />
              <Text style={styles.approvalLabel}>Authorized signatory</Text>
            </View>
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
            <View>
              <Text style={styles.footerBrand}>ZenStax</Text>

              <Text style={styles.footerTagline}>
                Technology, software, data, networking, and security
                solutions
              </Text>
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