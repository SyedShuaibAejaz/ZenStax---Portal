"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  FilePen,
  FileText,
  Receipt,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardMetrics, RecentRow } from "@/lib/dashboard/metrics";
import { formatStatus, invoiceStatusClasses } from "@/lib/invoice-status";

type DashboardClientProps = {
  metrics: DashboardMetrics;
  greetingName: string | null;
  todayLabel: string;
  canCreate: boolean;
};

function useMoney(currency: string) {
  const full = new Intl.NumberFormat("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const compact = new Intl.NumberFormat("en-AE", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  return {
    full: (value: number) => `${currency} ${full.format(value)}`,
    compact: (value: number) => `${currency} ${compact.format(value)}`,
    short: (value: number) => compact.format(value),
  };
}

function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && (
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function Kpi({
  label,
  value,
  detail,
  icon: Icon,
  accent,
  href,
}: {
  label: string;
  value: string;
  detail: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  accent: "navy" | "red" | "orange" | "emerald";
  href?: string;
}) {
  const accents = {
    navy: "bg-[#071B31]/5 text-[#071B31]",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-[#E85D04]",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  const body = (
    <div className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`rounded-lg p-2 ${accents[accent]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
          {value}
        </p>
        <div className="mt-1 text-xs text-slate-500">{detail}</div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

function StatusPill({ status, quotation = false }: { status: string; quotation?: boolean }) {
  const quotationClasses: Record<string, string> = {
    accepted: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    converted: "bg-violet-50 text-violet-700 ring-violet-600/20",
    rejected: "bg-red-50 text-red-700 ring-red-600/20",
    expired: "bg-slate-100 text-slate-500 ring-slate-500/20",
    draft: "bg-slate-50 text-slate-600 ring-slate-500/20",
    sent: "bg-blue-50 text-blue-700 ring-blue-600/20",
  };

  const classes = quotation
    ? quotationClasses[status] ?? quotationClasses.draft
    : invoiceStatusClasses(status);

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${classes}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function RecentTable({
  rows,
  emptyText,
  emptyHref,
  emptyCta,
  quotation = false,
  format,
}: {
  rows: RecentRow[];
  emptyText: string;
  emptyHref: string;
  emptyCta: string;
  quotation?: boolean;
  format: (value: number) => string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
        <p className="text-sm text-slate-500">{emptyText}</p>
        <Link
          href={emptyHref}
          className="mt-3 inline-block text-sm font-medium text-[#E85D04] hover:underline"
        >
          {emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {rows.map((row) => (
        <li key={row.id}>
          <Link
            href={row.href}
            className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-slate-50"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">{row.number}</p>
              <p className="truncate text-xs text-slate-500">
                {row.client} · {row.date}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-sm font-medium tabular-nums text-slate-900">
                {format(row.amount)}
              </span>
              <StatusPill status={row.status} quotation={quotation} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function DashboardClient({
  metrics,
  greetingName,
  todayLabel,
  canCreate,
}: DashboardClientProps) {
  const money = useMoney(metrics.currency);

  const agingTotal = metrics.aging.reduce((sum, b) => sum + b.amount, 0);
  const hasChartData = metrics.monthly.some((m) => m.invoiced > 0);

  const attentionIcon = {
    overdue: <AlertTriangle className="h-4 w-4 text-red-600" />,
    expiring: <Clock className="h-4 w-4 text-amber-600" />,
    draft: <FilePen className="h-4 w-4 text-slate-500" />,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">{todayLabel}</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            {greetingName ? `Welcome back, ${greetingName}` : "Overview"}
          </h2>
        </div>

        {canCreate && (
          <div className="flex gap-2">
            <Link
              href="/quotations/new"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              New quotation
            </Link>
            <Link
              href="/invoices/new"
              className="rounded-lg bg-[#E85D04] px-4 py-2 text-sm font-medium text-white hover:bg-[#cf5203]"
            >
              New invoice
            </Link>
          </div>
        )}
      </header>

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Outstanding"
          value={money.full(metrics.outstanding)}
          detail={`${metrics.openInvoiceCount} open invoice${metrics.openInvoiceCount === 1 ? "" : "s"}`}
          icon={Wallet}
          accent="navy"
          href="/invoices"
        />
        <Kpi
          label="Overdue"
          value={money.full(metrics.overdue)}
          detail={
            metrics.overdueCount > 0 ? (
              <span className="font-medium text-red-600">
                {metrics.overdueCount} invoice{metrics.overdueCount === 1 ? "" : "s"} · oldest{" "}
                {metrics.oldestOverdueDays} days
              </span>
            ) : (
              "Nothing overdue"
            )
          }
          icon={AlertTriangle}
          accent="red"
          href="/invoices"
        />
        <Kpi
          label="Invoiced this month"
          value={money.full(metrics.invoicedThisMonth)}
          detail={`Last month ${money.full(metrics.invoicedLastMonth)} · net of credit notes`}
          icon={Receipt}
          accent="emerald"
        />
        <Kpi
          label="Open quotations"
          value={money.full(metrics.pipelineValue)}
          detail={`${metrics.pipelineCount} sent or accepted${metrics.winRate !== null ? ` · ${metrics.winRate}% win rate` : ""}`}
          icon={FileText}
          accent="orange"
          href="/quotations"
        />
      </section>

      {/* Chart + attention */}
      <section className="grid gap-4 xl:grid-cols-3">
        <Card
          title="Invoiced per month"
          className="xl:col-span-2"
          action={
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#071B31]" /> Invoiced
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#E85D04]" /> Paid so far
              </span>
            </div>
          }
        >
          {hasChartData ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.monthly} barGap={2}>
                  <CartesianGrid vertical={false} stroke="#EEF2F6" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748B", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tick={{ fill: "#64748B", fontSize: 12 }}
                    tickFormatter={(value: number) => money.short(value)}
                  />
                  <Tooltip
                    cursor={{ fill: "#F1F5F9" }}
                    formatter={(value, name) => [
                      money.full(Number(value)),
                      name === "invoiced" ? "Invoiced" : "Paid so far",
                    ]}
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "#E2E8F0",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="invoiced" fill="#071B31" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="collectedShare" fill="#E85D04" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
              Monthly totals appear once you send your first invoice.
            </div>
          )}
        </Card>

        <Card title="Needs attention">
          {metrics.attention.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-slate-900">All clear</p>
              <p className="mt-1 text-sm text-slate-500">
                No overdue invoices, expiring quotations or forgotten drafts.
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {metrics.attention.map((item) => (
                <li key={item.href + item.kind}>
                  <Link
                    href={item.href}
                    className="-mx-2 flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-slate-50"
                  >
                    <span className="mt-0.5">{attentionIcon[item.kind]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      <p className="truncate text-xs text-slate-500">{item.subtitle}</p>
                    </div>
                    <span className="shrink-0 text-sm tabular-nums text-slate-700">
                      {money.compact(item.amount)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* Aging, VAT, clients */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card title="Receivables by age">
          {agingTotal > 0 ? (
            <>
              <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
                {metrics.aging.map((bucket) =>
                  bucket.amount > 0 ? (
                    <div
                      key={bucket.label}
                      className={bucket.tone}
                      style={{ width: `${(bucket.amount / agingTotal) * 100}%` }}
                      title={`${bucket.label}: ${money.full(bucket.amount)}`}
                    />
                  ) : null,
                )}
              </div>
              <dl className="mt-4 space-y-2.5">
                {metrics.aging.map((bucket) => (
                  <div key={bucket.label} className="flex items-center justify-between text-sm">
                    <dt className="flex items-center gap-2 text-slate-600">
                      <span className={`h-2.5 w-2.5 rounded-full ${bucket.tone}`} />
                      {bucket.label}
                      {bucket.count > 0 && (
                        <span className="text-xs text-slate-400">({bucket.count})</span>
                      )}
                    </dt>
                    <dd className="tabular-nums font-medium text-slate-900">
                      {money.full(bucket.amount)}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              No money owed to you right now.
            </p>
          )}
        </Card>

        <Card
          title="VAT this quarter"
          action={<span className="text-xs text-slate-500">{metrics.vat.label}</span>}
        >
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Taxable sales</dt>
              <dd className="tabular-nums text-slate-900">{money.full(metrics.vat.taxableSales)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Output VAT on invoices</dt>
              <dd className="tabular-nums text-slate-900">{money.full(metrics.vat.outputVat)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Less credit notes</dt>
              <dd className="tabular-nums text-slate-900">- {money.full(metrics.vat.creditVat)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2.5 font-semibold">
              <dt className="text-slate-900">Net output VAT</dt>
              <dd className="tabular-nums text-[#E85D04]">{money.full(metrics.vat.netVat)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs leading-5 text-slate-400">
            Calendar quarter, by invoice date. Check it against your FTA tax
            period; input VAT on purchases isn&apos;t tracked here.
          </p>
        </Card>

        <Card
          title="Top clients by balance"
          action={
            <span className="text-xs text-slate-500">
              {metrics.clientCount} client{metrics.clientCount === 1 ? "" : "s"}
            </span>
          }
        >
          {metrics.topClients.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Client balances appear once invoices are sent.
            </p>
          ) : (
            <ul className="space-y-3">
              {metrics.topClients.map((client) => {
                const share =
                  client.invoiced > 0 ? Math.min(client.outstanding / client.invoiced, 1) : 0;
                return (
                  <li key={client.name}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate font-medium text-slate-900">{client.name}</span>
                      <span className="shrink-0 tabular-nums text-slate-900">
                        {money.full(client.outstanding)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#071B31]"
                        style={{ width: `${share * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      of {money.full(client.invoiced)} invoiced
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>

      {/* Recent */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Recent invoices"
          action={
            <Link href="/invoices" className="text-xs font-medium text-[#E85D04] hover:underline">
              View all
            </Link>
          }
        >
          <RecentTable
            rows={metrics.recentInvoices}
            emptyText="No invoices yet."
            emptyHref="/quotations"
            emptyCta="Convert an accepted quotation"
            format={money.full}
          />
        </Card>

        <Card
          title="Recent quotations"
          action={
            <Link href="/quotations" className="text-xs font-medium text-[#E85D04] hover:underline">
              View all
            </Link>
          }
        >
          <RecentTable
            rows={metrics.recentQuotations}
            emptyText="No quotations yet."
            emptyHref="/quotations/new"
            emptyCta="Create your first quotation"
            quotation
            format={money.full}
          />
        </Card>
      </section>

      {metrics.otherCurrencyCount > 0 && (
        <p className="text-xs text-slate-400">
          Totals are in {metrics.currency}. {metrics.otherCurrencyCount} document
          {metrics.otherCurrencyCount === 1 ? "" : "s"} in other currencies are
          not included.
        </p>
      )}
    </div>
  );
}
