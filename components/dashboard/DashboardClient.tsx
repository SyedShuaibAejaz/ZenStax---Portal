"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";

type ChartPoint = {
  label: string;
  revenue: number;
  invoices: number;
  quotations: number;
};

type DashboardClientProps = {
  paidRevenue: number;
  outstandingAmount: number;
  overdueAmount: number;
  openInvoiceCount: number;
  pendingQuotationCount: number;
  clientCount: number;
  invoices: Array<{
    id: string;
    invoice_number: string;
    status: string;
    currency: string;
    total: number | string;
    amount_paid: number | string;
    issue_date: string;
    due_date: string | null;
    clients:
      | {
          name: string;
          company_name: string | null;
        }
      | null;
  }>;
  quotations: Array<{
    id: string;
    quotation_number: string;
    status: string;
    currency: string;
    total: number | string;
    issue_date: string;
    clients:
      | {
          name: string;
          company_name: string | null;
        }
      | null;
  }>;
  documents: Array<{
    id: string;
    title: string;
    category: string;
    file_name: string;
    created_at: string;
  }>;
  dailyData: ChartPoint[];
  monthlyData: ChartPoint[];
  yearlyData: ChartPoint[];
  statusCounts: Record<string, number>;
};

function formatMoney(
  amount: number,
  currency = "AED",
) {
  return new Intl.NumberFormat(
    "en-AE",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    },
  ).format(amount);
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-AE",
    {
      dateStyle: "medium",
    },
  ).format(new Date(value));
}

export default function DashboardClient({
  paidRevenue,
  outstandingAmount,
  overdueAmount,
  openInvoiceCount,
  pendingQuotationCount,
  clientCount,
  invoices,
  quotations,
  documents,
  dailyData,
  monthlyData,
  yearlyData,
  statusCounts,
}: DashboardClientProps) {
  const [period, setPeriod] =
    useState<"daily" | "monthly" | "yearly">(
      "monthly",
    );

  const chartData =
    period === "daily"
      ? dailyData
      : period === "yearly"
        ? yearlyData
        : monthlyData;

  const statusData = Object.entries(
    statusCounts,
  ).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <main className="min-h-screen bg-[#F6F8FB] px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
              Business overview
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#071B31]">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track performance, receivables, and activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/clients/new"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              New client
            </Link>

            <Link
              href="/quotations/new"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              New quotation
            </Link>

            <Link
              href="/invoices/new"
              className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
            >
              New invoice
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          <KpiCard
            label="Collected"
            value={formatMoney(paidRevenue)}
            detail="Paid invoice value"
            tone="orange"
          />

          <KpiCard
            label="Receivables"
            value={formatMoney(outstandingAmount)}
            detail={`${openInvoiceCount} open invoice${
              openInvoiceCount === 1
                ? ""
                : "s"
            }`}
            tone="blue"
          />

          <KpiCard
            label="Overdue"
            value={formatMoney(overdueAmount)}
            detail="Needs follow-up"
            tone="red"
          />

          <KpiCard
            label="Quotations"
            value={String(pendingQuotationCount)}
            detail="Draft or sent"
            tone="purple"
          />

          <KpiCard
            label="Clients"
            value={String(clientCount)}
            detail="Workspace clients"
            tone="slate"
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Revenue and activity
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Paid revenue, invoices, and quotations
                </p>
              </div>

              <div className="flex rounded-lg bg-slate-100 p-1">
                {[
                  ["daily", "Daily"],
                  ["monthly", "Monthly"],
                  ["yearly", "Yearly"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setPeriod(
                        value as
                          | "daily"
                          | "monthly"
                          | "yearly",
                      )
                    }
                    className={[
                      "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                      period === value
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 h-[300px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#F97316"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#F97316"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#E2E8F0"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#94A3B8",
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#94A3B8",
                      fontSize: 11,
                    }}
                    tickFormatter={(value) =>
                      `AED ${value}`
                    }
                  />

                  <Tooltip
                    formatter={(
                      value,
                      name,
                    ) => [
                      name === "revenue"
                        ? formatMoney(
                            Number(value),
                          )
                        : value,
                      name === "revenue"
                        ? "Revenue"
                        : name ===
                            "invoices"
                          ? "Invoices"
                          : "Quotations",
                    ]}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #E2E8F0",
                      boxShadow:
                        "0 8px 24px rgba(15,23,42,.08)",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#F97316"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                  />

                  <Area
                    type="monotone"
                    dataKey="invoices"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fill="transparent"
                  />

                  <Area
                    type="monotone"
                    dataKey="quotations"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
              <LegendDot
                color="#F97316"
                label="Revenue"
              />
              <LegendDot
                color="#2563EB"
                label="Invoices"
              />
              <LegendDot
                color="#7C3AED"
                label="Quotations"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Invoice status
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Current billing pipeline
            </p>

            <div className="mt-5 h-[230px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={86}
                    paddingAngle={3}
                  >
                    {statusData.map(
                      (entry, index) => (
                        <Cell
                          key={`${entry.name}-${index}`}
                          fill={
                            [
                              "#22C55E",
                              "#F97316",
                              "#2563EB",
                              "#EF4444",
                              "#94A3B8",
                              "#EAB308",
                            ][
                              index % 6
                            ]
                          }
                        />
                      ),
                    )}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {statusData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="capitalize text-slate-500">
                    {item.name.replace(
                      "_",
                      " ",
                    )}
                  </span>

                  <span className="font-semibold text-slate-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Recent invoices
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Latest billing activity
                </p>
              </div>

              <Link
                href="/invoices"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700"
              >
                View all
              </Link>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="pb-3 pr-4">
                      Invoice
                    </th>
                    <th className="pb-3 pr-4">
                      Client
                    </th>
                    <th className="pb-3 pr-4">
                      Due
                    </th>
                    <th className="pb-3 pr-4">
                      Total
                    </th>
                    <th className="pb-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {invoices
                    .slice(0, 6)
                    .map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-3 pr-4 font-semibold text-slate-900">
                          {invoice.invoice_number}
                        </td>

                        <td className="py-3 pr-4 text-slate-600">
                          {invoice.clients
                            ?.company_name ??
                            invoice.clients
                              ?.name ??
                            "Unknown"}
                        </td>

                        <td className="py-3 pr-4 text-slate-500">
                          {formatDate(
                            invoice.due_date,
                          )}
                        </td>

                        <td className="py-3 pr-4 font-semibold text-slate-900">
                          {formatMoney(
                            Number(
                              invoice.total,
                            ),
                            invoice.currency,
                          )}
                        </td>

                        <td className="py-3">
                          <StatusBadge
                            status={
                              invoice.status
                            }
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {invoices.length === 0 ? (
                <EmptyState text="No invoices yet." />
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Recent quotations
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Latest proposals
                </p>
              </div>

              <Link
                href="/quotations"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700"
              >
                View all
              </Link>
            </div>

            <div className="mt-5 space-y-2.5">
              {quotations
                .slice(0, 6)
                .map((quotation) => (
                  <div
                    key={quotation.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {quotation.quotation_number}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {quotation.clients
                          ?.company_name ??
                          quotation.clients
                            ?.name ??
                          "Unknown"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatMoney(
                          Number(
                            quotation.total,
                          ),
                          quotation.currency,
                        )}
                      </p>

                      <StatusBadge
                        status={
                          quotation.status
                        }
                      />
                    </div>
                  </div>
                ))}

              {quotations.length === 0 ? (
                <EmptyState text="No quotations yet." />
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Recent documents
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Latest workspace files
                </p>
              </div>

              <Link
                href="/documents"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700"
              >
                View all
              </Link>
            </div>

            <div className="mt-5 space-y-2">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {document.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {document.file_name}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-600">
                    {document.category}
                  </span>
                </div>
              ))}

              {documents.length === 0 ? (
                <EmptyState text="No documents yet." />
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Quick actions
            </h2>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <QuickAction
                href="/clients/new"
                title="Add client"
                detail="Create a client record"
              />

              <QuickAction
                href="/quotations/new"
                title="New quotation"
                detail="Prepare a proposal"
              />

              <QuickAction
                href="/invoices/new"
                title="New invoice"
                detail="Issue an invoice"
              />

              <QuickAction
                href="/documents"
                title="Upload document"
                detail="Store a business file"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function KpiCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "orange" | "blue" | "red" | "purple" | "slate";
}) {
  const tones = {
    orange: "border-orange-100 bg-orange-50/60 text-orange-600",
    blue: "border-blue-100 bg-blue-50/60 text-blue-600",
    red: "border-red-100 bg-red-50/60 text-red-600",
    purple: "border-purple-100 bg-purple-50/60 text-purple-600",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${tones[tone]}`}
      >
        {label}
      </div>

      <p className="mt-4 truncate text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
        {value}
      </p>

      <p className="mt-1 truncate text-xs text-slate-500">
        {detail}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toLowerCase();

  const classes =
    normalized === "paid" ||
    normalized === "accepted"
      ? "bg-green-50 text-green-700"
      : normalized === "overdue"
        ? "bg-red-50 text-red-700"
        : normalized === "cancelled"
          ? "bg-slate-100 text-slate-500"
          : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold capitalize ${classes}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function LegendDot({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function QuickAction({
  href,
  title,
  detail,
}: {
  href: string;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 p-3 transition hover:border-orange-200 hover:bg-orange-50"
    >
      <p className="text-sm font-semibold text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {detail}
      </p>
    </Link>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
      {text}
    </p>
  );
}