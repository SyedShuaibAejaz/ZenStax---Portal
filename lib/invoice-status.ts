export type InvoiceMoneyFields = {
  status: string;
  total: number | string | null;
  amount_paid: number | string | null;
  credited_amount?: number | string | null;
  due_date: string | null;
};

export function todayInDubai() {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(
    new Date(),
  );
}

export function invoiceBalance(invoice: InvoiceMoneyFields) {
  const net = Number(invoice.total ?? 0) - Number(invoice.credited_amount ?? 0);
  return Math.round((net - Number(invoice.amount_paid ?? 0)) * 100) / 100;
}

export function daysBetween(fromIso: string, toIso: string) {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

/**
 * The status to show. "overdue" is worked out from the due date, so it is
 * always correct without a background job updating rows.
 */
export function effectiveInvoiceStatus(
  invoice: InvoiceMoneyFields,
  today = todayInDubai(),
) {
  if (
    (invoice.status === "sent" ||
      invoice.status === "partially_paid" ||
      invoice.status === "overdue") &&
    invoice.due_date &&
    invoice.due_date < today &&
    invoiceBalance(invoice) > 0.005
  ) {
    return "overdue";
  }

  if (invoice.status === "overdue" && invoiceBalance(invoice) <= 0.005) {
    return "paid";
  }

  return invoice.status;
}

export function invoiceStatusClasses(status: string) {
  switch (status) {
    case "paid":
      return "bg-emerald-500/15 text-emerald-700 ring-emerald-600/20 dark:text-emerald-300";
    case "partially_paid":
      return "bg-amber-500/15 text-amber-700 ring-amber-600/20 dark:text-amber-300";
    case "overdue":
      return "bg-red-500/15 text-red-700 ring-red-600/20 dark:text-red-300";
    case "cancelled":
      return "bg-muted text-muted-foreground ring-border";
    case "draft":
      return "bg-muted/70 text-muted-foreground ring-border";
    default:
      return "bg-blue-500/15 text-blue-700 ring-blue-600/20 dark:text-blue-300";
  }
}

export function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}
