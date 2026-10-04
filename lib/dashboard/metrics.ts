import {
  daysBetween,
  effectiveInvoiceStatus,
  invoiceBalance,
} from "@/lib/invoice-status";

type ClientRef = { name: string; company_name: string | null } | null;

export type DashboardInvoice = {
  id: string;
  invoice_number: string;
  status: string;
  currency: string;
  total: number | string;
  amount_paid: number | string;
  credited_amount: number | string | null;
  vat_amount: number | string;
  issue_date: string;
  due_date: string | null;
  created_at: string;
  client_id: string;
  clients: ClientRef | ClientRef[];
};

export type DashboardQuotation = {
  id: string;
  quotation_number: string;
  status: string;
  currency: string;
  total: number | string;
  issue_date: string;
  valid_until: string | null;
  created_at: string;
  clients: ClientRef | ClientRef[];
};

export type DashboardCreditNote = {
  total: number | string;
  vat_amount: number | string;
  issue_date: string;
  currency: string;
};

export type AttentionItem = {
  kind: "overdue" | "expiring" | "draft";
  href: string;
  title: string;
  subtitle: string;
  amount: number;
  urgency: number;
};

export type RecentRow = {
  id: string;
  href: string;
  number: string;
  client: string;
  date: string;
  amount: number;
  status: string;
};

export type DashboardMetrics = {
  currency: string;
  otherCurrencyCount: number;
  outstanding: number;
  openInvoiceCount: number;
  overdue: number;
  overdueCount: number;
  oldestOverdueDays: number;
  invoicedThisMonth: number;
  invoicedLastMonth: number;
  collected: number;
  pipelineValue: number;
  pipelineCount: number;
  winRate: number | null;
  clientCount: number;
  vat: {
    label: string;
    taxableSales: number;
    outputVat: number;
    creditVat: number;
    netVat: number;
  };
  aging: { label: string; amount: number; count: number; tone: string }[];
  monthly: { label: string; invoiced: number; collectedShare: number }[];
  topClients: { name: string; outstanding: number; invoiced: number }[];
  attention: AttentionItem[];
  recentInvoices: RecentRow[];
  recentQuotations: RecentRow[];
};

const money = (value: number | string | null | undefined) => Number(value ?? 0);
const round = (value: number) => Math.round(value * 100) / 100;

function clientName(clients: ClientRef | ClientRef[]) {
  const client = Array.isArray(clients) ? clients[0] : clients;
  return client?.company_name || client?.name || "Unknown client";
}

function quarterOf(today: string) {
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  const q = Math.floor((month - 1) / 3);
  const startMonth = q * 3 + 1;
  const start = `${year}-${String(startMonth).padStart(2, "0")}-01`;
  const endMonth = startMonth + 2;
  const end = `${year}-${String(endMonth).padStart(2, "0")}-31`;
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return {
    start,
    end,
    label: `Q${q + 1} ${year} (${names[startMonth - 1]}–${names[endMonth - 1]})`,
  };
}

function shiftMonth(yyyyMm: string, delta: number) {
  const [y, m] = yyyyMm.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function buildDashboardMetrics({
  invoices,
  quotations,
  creditNotes,
  clientCount,
  today,
  currency = "AED",
}: {
  invoices: DashboardInvoice[];
  quotations: DashboardQuotation[];
  creditNotes: DashboardCreditNote[];
  clientCount: number;
  today: string;
  currency?: string;
}): DashboardMetrics {
  const sameCurrency = invoices.filter((invoice) => invoice.currency === currency);
  const otherCurrencyCount =
    invoices.length - sameCurrency.length +
    quotations.filter((q) => q.currency !== currency).length;

  const issued = sameCurrency.filter(
    (invoice) => invoice.status !== "draft",
  );
  const open = issued.filter(
    (invoice) => invoice.status !== "cancelled" && invoiceBalance(invoice) > 0.005,
  );

  const thisMonth = today.slice(0, 7);
  const lastMonth = shiftMonth(thisMonth, -1);

  const creditsByMonth = new Map<string, number>();
  for (const note of creditNotes.filter((n) => n.currency === currency)) {
    const key = note.issue_date.slice(0, 7);
    creditsByMonth.set(key, (creditsByMonth.get(key) ?? 0) + money(note.total));
  }

  const invoicedIn = (month: string) =>
    issued
      .filter((invoice) => invoice.issue_date.startsWith(month))
      .reduce((sum, invoice) => sum + money(invoice.total), 0) -
    (creditsByMonth.get(month) ?? 0);

  // Receivables
  let overdue = 0;
  let overdueCount = 0;
  let oldestOverdueDays = 0;
  const agingBuckets = [
    { label: "Not yet due", amount: 0, count: 0, tone: "bg-sky-500" },
    { label: "1–30 days", amount: 0, count: 0, tone: "bg-amber-400" },
    { label: "31–60 days", amount: 0, count: 0, tone: "bg-orange-500" },
    { label: "61–90 days", amount: 0, count: 0, tone: "bg-red-500" },
    { label: "90+ days", amount: 0, count: 0, tone: "bg-red-700" },
  ];

  const attention: AttentionItem[] = [];

  for (const invoice of open) {
    const balance = invoiceBalance(invoice);
    const daysLate = invoice.due_date ? daysBetween(invoice.due_date, today) : 0;
    const bucket =
      daysLate <= 0 ? 0 : daysLate <= 30 ? 1 : daysLate <= 60 ? 2 : daysLate <= 90 ? 3 : 4;

    agingBuckets[bucket].amount += balance;
    agingBuckets[bucket].count += 1;

    if (effectiveInvoiceStatus(invoice, today) === "overdue") {
      overdue += balance;
      overdueCount += 1;
      oldestOverdueDays = Math.max(oldestOverdueDays, daysLate);

      attention.push({
        kind: "overdue",
        href: `/invoices/${invoice.id}`,
        title: `${invoice.invoice_number} is ${daysLate} day${daysLate === 1 ? "" : "s"} overdue`,
        subtitle: clientName(invoice.clients),
        amount: balance,
        urgency: 1000 + daysLate,
      });
    }
  }

  // Quotations about to expire, and drafts left unsent
  for (const quotation of quotations) {
    if (quotation.status === "sent" && quotation.valid_until) {
      const daysLeft = daysBetween(today, quotation.valid_until);
      if (daysLeft >= 0 && daysLeft <= 7) {
        attention.push({
          kind: "expiring",
          href: `/quotations/${quotation.id}`,
          title: `${quotation.quotation_number} expires ${daysLeft === 0 ? "today" : `in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}`,
          subtitle: clientName(quotation.clients),
          amount: money(quotation.total),
          urgency: 500 + (7 - daysLeft),
        });
      }
    }
  }

  for (const invoice of sameCurrency) {
    if (invoice.status === "draft") {
      const age = daysBetween(invoice.created_at.slice(0, 10), today);
      if (age >= 2) {
        attention.push({
          kind: "draft",
          href: `/invoices/${invoice.id}`,
          title: `Draft ${invoice.invoice_number} not sent for ${age} days`,
          subtitle: clientName(invoice.clients),
          amount: money(invoice.total),
          urgency: age,
        });
      }
    }
  }

  attention.sort((a, b) => b.urgency - a.urgency);

  // Quotation pipeline
  const pipeline = quotations.filter(
    (q) => q.currency === currency && (q.status === "sent" || q.status === "accepted"),
  );
  const won = quotations.filter((q) => q.status === "accepted" || q.status === "converted").length;
  const lost = quotations.filter((q) => q.status === "rejected" || q.status === "expired").length;

  // VAT for the current calendar quarter
  const quarter = quarterOf(today);
  const inQuarter = (date: string) => date >= quarter.start && date <= quarter.end;
  const quarterInvoices = issued.filter((invoice) => inQuarter(invoice.issue_date));
  const outputVat = quarterInvoices.reduce((sum, i) => sum + money(i.vat_amount), 0);
  const taxableSales = quarterInvoices.reduce(
    (sum, i) => sum + money(i.total) - money(i.vat_amount),
    0,
  );
  const creditVat = creditNotes
    .filter((n) => n.currency === currency && inQuarter(n.issue_date))
    .reduce((sum, n) => sum + money(n.vat_amount), 0);

  // Last 12 months
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthly = Array.from({ length: 12 }, (_, index) => {
    const key = shiftMonth(thisMonth, index - 11);
    const monthInvoices = issued.filter((invoice) => invoice.issue_date.startsWith(key));
    const invoiced = invoicedIn(key);
    const paid = monthInvoices.reduce((sum, i) => sum + money(i.amount_paid), 0);
    return {
      label: `${monthNames[Number(key.slice(5, 7)) - 1]}${key.endsWith("-01") ? ` ${key.slice(2, 4)}` : ""}`,
      invoiced: round(Math.max(invoiced, 0)),
      collectedShare: round(paid),
    };
  });

  // Top clients by money owed
  const byClient = new Map<string, { name: string; outstanding: number; invoiced: number }>();
  for (const invoice of issued.filter((i) => i.status !== "cancelled")) {
    const entry = byClient.get(invoice.client_id) ?? {
      name: clientName(invoice.clients),
      outstanding: 0,
      invoiced: 0,
    };
    entry.invoiced += money(invoice.total) - money(invoice.credited_amount);
    entry.outstanding += Math.max(invoiceBalance(invoice), 0);
    byClient.set(invoice.client_id, entry);
  }

  const topClients = [...byClient.values()]
    .sort((a, b) => b.outstanding - a.outstanding || b.invoiced - a.invoiced)
    .slice(0, 5)
    .map((c) => ({ ...c, outstanding: round(c.outstanding), invoiced: round(c.invoiced) }));

  return {
    currency,
    otherCurrencyCount,
    outstanding: round(open.reduce((sum, i) => sum + invoiceBalance(i), 0)),
    openInvoiceCount: open.length,
    overdue: round(overdue),
    overdueCount,
    oldestOverdueDays,
    invoicedThisMonth: round(invoicedIn(thisMonth)),
    invoicedLastMonth: round(invoicedIn(lastMonth)),
    collected: round(issued.reduce((sum, i) => sum + money(i.amount_paid), 0)),
    pipelineValue: round(pipeline.reduce((sum, q) => sum + money(q.total), 0)),
    pipelineCount: pipeline.length,
    winRate: won + lost > 0 ? Math.round((won / (won + lost)) * 100) : null,
    clientCount,
    vat: {
      label: quarter.label,
      taxableSales: round(taxableSales),
      outputVat: round(outputVat),
      creditVat: round(creditVat),
      netVat: round(outputVat - creditVat),
    },
    aging: agingBuckets.map((b) => ({ ...b, amount: round(b.amount) })),
    monthly,
    topClients,
    attention: attention.slice(0, 6),
    recentInvoices: invoices.slice(0, 5).map((invoice) => ({
      id: invoice.id,
      href: `/invoices/${invoice.id}`,
      number: invoice.invoice_number,
      client: clientName(invoice.clients),
      date: invoice.issue_date,
      amount: money(invoice.total),
      status: effectiveInvoiceStatus(invoice, today),
    })),
    recentQuotations: quotations.slice(0, 5).map((quotation) => ({
      id: quotation.id,
      href: `/quotations/${quotation.id}`,
      number: quotation.quotation_number,
      client: clientName(quotation.clients),
      date: quotation.issue_date,
      amount: money(quotation.total),
      status: quotation.status,
    })),
  };
}
