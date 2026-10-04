import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const instant = false;


type InvoiceRow = {
  id: string;
  invoice_number: string;
  status: string;
  currency: string;
  total: number | string;
  amount_paid: number | string;
  issue_date: string;
  due_date: string | null;
  created_at: string;
  clients:
    | {
        name: string;
        company_name: string | null;
      }
    | null;
};

type QuotationRow = {
  id: string;
  quotation_number: string;
  status: string;
  currency: string;
  total: number | string;
  issue_date: string;
  created_at: string;
  clients:
    | {
        name: string;
        company_name: string | null;
      }
    | null;
};

type DocumentRow = {
  id: string;
  title: string;
  category: string;
  file_name: string;
  created_at: string;
};

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}`;
}

function yearKey(date: Date) {
  return String(date.getFullYear());
}

function monthLabel(date: Date) {
  return date.toLocaleDateString(
    "en-AE",
    {
      month: "short",
    },
  );
}

export default async function DashboardPage() {
  const supabase =
    await createClient();

  const {
    data: authData,
    error: authError,
  } =
    await supabase.auth.getUser();

  if (
    authError ||
    !authData.user
  ) {
    redirect("/login");
  }

  const user = authData.user;

  const {
    data: membership,
    error: membershipError,
  } =
    await supabase
      .from("workspace_members")
      .select(
        "workspace_id, role",
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

  if (
    membershipError ||
    !membership?.workspace_id
  ) {
    return (
      <main className="min-h-screen bg-[#F6F8FB] p-6">
        <div className="mx-auto max-w-7xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Your account is not assigned to a workspace.
        </div>
      </main>
    );
  }

  const workspaceId =
    membership.workspace_id;

  const [
    invoicesResult,
    quotationsResult,
    clientsResult,
    documentsResult,
  ] = await Promise.all([
    supabase
      .from("invoices")
      .select(
        `
          id,
          invoice_number,
          status,
          currency,
          total,
          amount_paid,
          issue_date,
          due_date,
          created_at,
          clients (
            name,
            company_name
          )
        `,
      )
      .eq(
        "workspace_id",
        workspaceId,
      )
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("quotations")
      .select(
        `
          id,
          quotation_number,
          status,
          currency,
          total,
          issue_date,
          created_at,
          clients (
            name,
            company_name
          )
        `,
      )
      .eq(
        "workspace_id",
        workspaceId,
      )
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("clients")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "workspace_id",
        workspaceId,
      ),

    supabase
      .from("documents")
      .select(
        `
          id,
          title,
          category,
          file_name,
          created_at
        `,
      )
      .eq(
        "workspace_id",
        workspaceId,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(5),
  ]);

  const invoices =
    (invoicesResult.data ??
      []) as unknown as InvoiceRow[];

  const quotations =
    (quotationsResult.data ??
      []) as unknown as QuotationRow[];

  const documents =
    (documentsResult.data ??
      []) as DocumentRow[];

  const paidRevenue =
    invoices.reduce(
      (sum, invoice) =>
        invoice.status === "paid"
          ? sum + Number(invoice.total)
          : sum,
      0,
    );

  const outstandingAmount =
    invoices.reduce(
      (sum, invoice) => {
        if (
          invoice.status === "paid" ||
          invoice.status === "cancelled"
        ) {
          return sum;
        }

        return (
          sum +
          Math.max(
            Number(invoice.total) -
              Number(invoice.amount_paid),
            0,
          )
        );
      },
      0,
    );

  const overdueAmount =
    invoices.reduce(
      (sum, invoice) => {
        if (
          invoice.status !== "overdue"
        ) {
          return sum;
        }

        return (
          sum +
          Math.max(
            Number(invoice.total) -
              Number(invoice.amount_paid),
            0,
          )
        );
      },
      0,
    );

  const openInvoiceCount =
    invoices.filter(
      (invoice) =>
        invoice.status !== "paid" &&
        invoice.status !== "cancelled",
    ).length;

  const pendingQuotationCount =
    quotations.filter(
      (quotation) =>
        quotation.status === "draft" ||
        quotation.status === "sent",
    ).length;

  const today = new Date();

  const dailyMap = new Map<
    string,
    {
      label: string;
      revenue: number;
      invoices: number;
      quotations: number;
    }
  >();

  for (let index = 6; index >= 0; index--) {
    const date = new Date(today);
    date.setDate(
      today.getDate() - index,
    );

    dailyMap.set(dateKey(date), {
      label: date.toLocaleDateString(
        "en-AE",
        {
          weekday: "short",
        },
      ),
      revenue: 0,
      invoices: 0,
      quotations: 0,
    });
  }

  for (const invoice of invoices) {
    const key = invoice.issue_date;

    const item = dailyMap.get(key);

    if (item) {
      item.invoices += 1;

      if (
        invoice.status === "paid"
      ) {
        item.revenue += Number(
          invoice.total,
        );
      }
    }
  }

  for (const quotation of quotations) {
    const item =
      dailyMap.get(
        quotation.issue_date,
      );

    if (item) {
      item.quotations += 1;
    }
  }

  const monthlyMap = new Map<
    string,
    {
      label: string;
      revenue: number;
      invoices: number;
      quotations: number;
    }
  >();

  for (let index = 11; index >= 0; index--) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth() - index,
      1,
    );

    monthlyMap.set(monthKey(date), {
      label: monthLabel(date),
      revenue: 0,
      invoices: 0,
      quotations: 0,
    });
  }

  for (const invoice of invoices) {
    const item =
      monthlyMap.get(
        invoice.issue_date.slice(0, 7),
      );

    if (item) {
      item.invoices += 1;

      if (
        invoice.status === "paid"
      ) {
        item.revenue += Number(
          invoice.total,
        );
      }
    }
  }

  for (const quotation of quotations) {
    const item =
      monthlyMap.get(
        quotation.issue_date.slice(0, 7),
      );

    if (item) {
      item.quotations += 1;
    }
  }

  const yearlyMap = new Map<
    string,
    {
      label: string;
      revenue: number;
      invoices: number;
      quotations: number;
    }
  >();

  for (let index = 4; index >= 0; index--) {
    const year =
      today.getFullYear() - index;

    yearlyMap.set(String(year), {
      label: String(year),
      revenue: 0,
      invoices: 0,
      quotations: 0,
    });
  }

  for (const invoice of invoices) {
    const item =
      yearlyMap.get(
        invoice.issue_date.slice(0, 4),
      );

    if (item) {
      item.invoices += 1;

      if (
        invoice.status === "paid"
      ) {
        item.revenue += Number(
          invoice.total,
        );
      }
    }
  }

  for (const quotation of quotations) {
    const item =
      yearlyMap.get(
        quotation.issue_date.slice(0, 4),
      );

    if (item) {
      item.quotations += 1;
    }
  }

  const statusCounts = invoices.reduce(
    (result, invoice) => {
      result[invoice.status] =
        (result[invoice.status] ?? 0) + 1;

      return result;
    },
    {} as Record<string, number>,
  );

  return (
    <DashboardClient
      paidRevenue={paidRevenue}
      outstandingAmount={outstandingAmount}
      overdueAmount={overdueAmount}
      openInvoiceCount={openInvoiceCount}
      pendingQuotationCount={
        pendingQuotationCount
      }
      clientCount={
        clientsResult.count ?? 0
      }
      invoices={invoices.slice(0, 8)}
      quotations={quotations.slice(0, 8)}
      documents={documents}
      dailyData={[
        ...dailyMap.values(),
      ]}
      monthlyData={[
        ...monthlyMap.values(),
      ]}
      yearlyData={[
        ...yearlyMap.values(),
      ]}
      statusCounts={statusCounts}
    />
  );
}