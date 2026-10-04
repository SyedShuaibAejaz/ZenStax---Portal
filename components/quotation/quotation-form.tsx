"use client";

import {
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ClientOption = {
  id: string;
  name: string;
  company_name: string | null;
};

export type CustomColumn = {
  key: string;
  label: string;
};

export type QuotationItemFormValue = {
  id?: string;
  description: string;
  quantity: string;
  unitPrice: string;
  vatRate: string;
  customValues?: Record<string, string>;
};

export type QuotationFormInitialValues = {
  clientId: string;
  issueDate: string;
  validUntil: string;
  discount: string;
  notes: string;
  customColumns?: CustomColumn[];
  items: QuotationItemFormValue[];
};

type QuotationFormProps = {
  clients: ClientOption[];
  quotationId?: string;
  initialValues?: QuotationFormInitialValues;
};

type WorkspaceMembership = {
  workspace_id: string;
  role: string;
};

const MAX_CUSTOM_COLUMNS = 4;
const MAX_COLUMN_LABEL_LENGTH = 30;

const RESERVED_COLUMN_NAMES = [
  "description",
  "qty",
  "quantity",
  "unit price",
  "vat",
  "amount",
];

const defaultInitialValues: QuotationFormInitialValues = {
  clientId: "",
  issueDate: "",
  validUntil: "",
  discount: "0",
  notes: "",
  customColumns: [],
  items: [],
};

function createEmptyItem(): QuotationItemFormValue {
  return {
    description: "",
    quantity: "1",
    unitPrice: "0",
    vatRate: "5",
    customValues: {},
  };
}

function createColumnKey() {
  return `col_${Math.random().toString(36).slice(2, 8)}`;
}

function getTodayDate() {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Dubai",
    },
  ).format(new Date());
}

function toNumber(
  value: string | number | null | undefined,
) {
  const numberValue =
    Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : 0;
}

function roundCurrency(value: number) {
  return Math.round(
    (value + Number.EPSILON) * 100,
  ) / 100;
}

export function QuotationForm({
  clients,
  quotationId,
  initialValues = defaultInitialValues,
}: QuotationFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [
    clientId,
    setClientId,
  ] = useState(
    initialValues.clientId,
  );

  const [
    issueDate,
    setIssueDate,
  ] = useState(
    initialValues.issueDate ||
      getTodayDate(),
  );

  const [
    validUntil,
    setValidUntil,
  ] = useState(
    initialValues.validUntil,
  );

  const [
    discount,
    setDiscount,
  ] = useState(
    initialValues.discount || "0",
  );

  const [
    notes,
    setNotes,
  ] = useState(
    initialValues.notes,
  );

  const [
    customColumns,
    setCustomColumns,
  ] = useState<CustomColumn[]>(
    initialValues.customColumns ?? [],
  );

  const [
    newColumnLabel,
    setNewColumnLabel,
  ] = useState("");

  const [
    items,
    setItems,
  ] = useState<
    QuotationItemFormValue[]
  >(
    initialValues.items.length
      ? initialValues.items.map((item) => ({
          ...item,
          customValues: item.customValues ?? {},
        }))
      : [createEmptyItem()],
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const isEditing =
    Boolean(quotationId);

  const totals = useMemo(() => {
    const subtotal =
      items.reduce(
        (sum, item) =>
          sum +
          toNumber(item.quantity) *
            toNumber(item.unitPrice),
        0,
      );

    const discountAmount =
      Math.min(
        Math.max(
          toNumber(discount),
          0,
        ),
        subtotal,
      );

    const taxableAmount =
      subtotal - discountAmount;

    const vatAmount =
      items.reduce(
        (sum, item) => {
          const itemBase =
            toNumber(item.quantity) *
            toNumber(item.unitPrice);

          const itemShare =
            subtotal > 0
              ? itemBase / subtotal
              : 0;

          const discountedItemBase =
            taxableAmount * itemShare;

          return (
            sum +
            discountedItemBase *
              (toNumber(
                item.vatRate,
              ) / 100)
          );
        },
        0,
      );

    return {
      subtotal:
        roundCurrency(subtotal),
      discount:
        roundCurrency(discountAmount),
      vatAmount:
        roundCurrency(vatAmount),
      total:
        roundCurrency(
          taxableAmount + vatAmount,
        ),
    };
  }, [items, discount]);

  function updateItem(
    itemIndex: number,
    field:
      | "description"
      | "quantity"
      | "unitPrice"
      | "vatRate",
    value: string,
  ) {
    setItems((currentItems) =>
      currentItems.map(
        (item, index) =>
          index === itemIndex
            ? {
                ...item,
                [field]: value,
              }
            : item,
      ),
    );
  }

  function updateCustomValue(
    itemIndex: number,
    columnKey: string,
    value: string,
  ) {
    setItems((currentItems) =>
      currentItems.map(
        (item, index) =>
          index === itemIndex
            ? {
                ...item,
                customValues: {
                  ...(item.customValues ?? {}),
                  [columnKey]: value,
                },
              }
            : item,
      ),
    );
  }

  function addItem() {
    setItems((currentItems) => [
      ...currentItems,
      createEmptyItem(),
    ]);
  }

  function removeItem(
    itemIndex: number,
  ) {
    setItems((currentItems) => {
      if (currentItems.length <= 1) {
        return currentItems;
      }

      return currentItems.filter(
        (_, index) =>
          index !== itemIndex,
      );
    });
  }

  function addColumn() {
    const label = newColumnLabel.trim();

    if (!label) {
      setError("Enter a name for the new column.");
      return;
    }

    if (label.length > MAX_COLUMN_LABEL_LENGTH) {
      setError(
        `Column names can be up to ${MAX_COLUMN_LABEL_LENGTH} characters.`,
      );
      return;
    }

    if (customColumns.length >= MAX_CUSTOM_COLUMNS) {
      setError(
        `You can add up to ${MAX_CUSTOM_COLUMNS} extra columns.`,
      );
      return;
    }

    const lowerLabel = label.toLowerCase();

    const isDuplicate =
      RESERVED_COLUMN_NAMES.includes(lowerLabel) ||
      customColumns.some(
        (column) =>
          column.label.trim().toLowerCase() ===
          lowerLabel,
      );

    if (isDuplicate) {
      setError("A column with this name already exists.");
      return;
    }

    setError(null);

    setCustomColumns((currentColumns) => [
      ...currentColumns,
      { key: createColumnKey(), label },
    ]);

    setNewColumnLabel("");
  }

  function renameColumn(
    columnKey: string,
    label: string,
  ) {
    setCustomColumns((currentColumns) =>
      currentColumns.map((column) =>
        column.key === columnKey
          ? { ...column, label }
          : column,
      ),
    );
  }

  function removeColumn(columnKey: string) {
    setCustomColumns((currentColumns) =>
      currentColumns.filter(
        (column) => column.key !== columnKey,
      ),
    );

    setItems((currentItems) =>
      currentItems.map((item) => {
        const { [columnKey]: _removed, ...rest } =
          item.customValues ?? {};

        return { ...item, customValues: rest };
      }),
    );
  }

  function validateForm() {
    if (!clientId) {
      return "Please select a client.";
    }

    if (!issueDate) {
      return "Issue date is required.";
    }

    if (
      validUntil &&
      validUntil < issueDate
    ) {
      return "Valid-until date cannot be before the issue date.";
    }

    if (toNumber(discount) < 0) {
      return "Discount cannot be negative.";
    }

    if (!items.length) {
      return "Add at least one line item.";
    }

    const labels = customColumns.map((column) =>
      column.label.trim().toLowerCase(),
    );

    if (labels.some((label) => !label)) {
      return "Every extra column needs a name.";
    }

    if (new Set(labels).size !== labels.length) {
      return "Extra column names must be unique.";
    }

    if (
      labels.some((label) =>
        RESERVED_COLUMN_NAMES.includes(label),
      )
    ) {
      return "An extra column cannot reuse a built-in column name.";
    }

    const invalidItem =
      items.some((item) => {
        const quantity =
          toNumber(item.quantity);

        const unitPrice =
          toNumber(item.unitPrice);

        const vatRate =
          toNumber(item.vatRate);

        return (
          !item.description.trim() ||
          quantity <= 0 ||
          unitPrice < 0 ||
          vatRate < 0 ||
          vatRate > 100
        );
      });

    if (invalidItem) {
      return "Check every line item before saving.";
    }

    return null;
  }

  async function getNextQuotationNumber() {
    const response =
      await fetch(
        "/api/quotations/next-number",
        {
          method: "GET",
          cache: "no-store",
        },
      );

    const result =
      (await response.json()) as {
        quotationNumber?: string;
        error?: string;
      };

    if (!response.ok) {
      throw new Error(
        result.error ??
          "Could not generate quotation number.",
      );
    }

    if (!result.quotationNumber) {
      throw new Error(
        "Quotation number was not returned.",
      );
    }

    return result.quotationNumber;
  }

  async function getWorkspaceMembership(
    userId: string,
  ) {
    const {
      data: membership,
      error: membershipError,
    } =
      await supabase
        .from("workspace_members")
        .select(
          "workspace_id, role",
        )
        .eq("user_id", userId)
        .order("created_at", {
          ascending: true,
        })
        .limit(1)
        .maybeSingle();

    if (
      membershipError ||
      !membership
    ) {
      throw new Error(
        membershipError?.message ??
          "You are not assigned to a workspace.",
      );
    }

    return membership as WorkspaceMembership;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);

    let createdQuotationId:
      | string
      | null = null;

    try {
      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Your session has expired. Please log in again.",
        );
      }

      const membership =
        await getWorkspaceMembership(
          user.id,
        );

      const role =
        membership.role.toLowerCase();

      if (
        role !== "owner" &&
        role !== "admin" &&
        role !== "finance"
      ) {
        throw new Error(
          "You do not have permission to manage quotations.",
        );
      }

      const workspaceId =
        membership.workspace_id;

      const cleanColumns = customColumns.map(
        (column) => ({
          key: column.key,
          label: column.label.trim(),
        }),
      );

      const quotationPayload = {
        workspace_id: workspaceId,
        client_id: clientId,
        issue_date: issueDate,
        valid_until:
          validUntil || null,
        currency: "AED",
        subtotal: totals.subtotal,
        discount: totals.discount,
        vat_amount: totals.vatAmount,
        total: totals.total,
        notes: notes.trim() || null,
        custom_columns: cleanColumns,
        updated_at:
          new Date().toISOString(),
      };

      let savedQuotationId:
        | string
        | null = quotationId ?? null;

      if (quotationId) {
        const {
          data: existingQuotation,
          error: quotationLookupError,
        } =
          await supabase
            .from("quotations")
            .select("id")
            .eq("id", quotationId)
            .eq(
              "workspace_id",
              workspaceId,
            )
            .maybeSingle();

        if (
          quotationLookupError ||
          !existingQuotation
        ) {
          throw new Error(
            quotationLookupError?.message ??
              "Quotation not found in this workspace.",
          );
        }

        const {
          error: updateError,
        } =
          await supabase
            .from("quotations")
            .update({
              client_id:
                quotationPayload.client_id,
              issue_date:
                quotationPayload.issue_date,
              valid_until:
                quotationPayload.valid_until,
              currency:
                quotationPayload.currency,
              subtotal:
                quotationPayload.subtotal,
              discount:
                quotationPayload.discount,
              vat_amount:
                quotationPayload.vat_amount,
              total:
                quotationPayload.total,
              notes:
                quotationPayload.notes,
              custom_columns:
                quotationPayload.custom_columns,
              updated_at:
                quotationPayload.updated_at,
            })
            .eq("id", quotationId)
            .eq(
              "workspace_id",
              workspaceId,
            );

        if (updateError) {
          throw updateError;
        }

        const {
          error: deleteItemsError,
        } =
          await supabase
            .from("quotation_items")
            .delete()
            .eq(
              "quotation_id",
              quotationId,
            );

        if (deleteItemsError) {
          throw deleteItemsError;
        }
      } else {
        const quotationNumber =
          await getNextQuotationNumber();

        const quotationInsert = {
          ...quotationPayload,
          quotation_number:
            quotationNumber,
          status: "draft" as const,
          created_by: user.id,
        };

        const {
          data: insertedQuotation,
          error: insertError,
        } =
          await supabase
            .from("quotations")
            .insert(
              quotationInsert,
            )
            .select(
              "id, quotation_number",
            )
            .single();

        if (
          insertError ||
          !insertedQuotation
        ) {
          throw (
            insertError ??
            new Error(
              "Could not create quotation.",
            )
          );
        }

        savedQuotationId =
          insertedQuotation.id;

        createdQuotationId =
          insertedQuotation.id;
      }

      if (!savedQuotationId) {
        throw new Error(
          "Quotation ID was not available.",
        );
      }

      const quotationItems =
        items.map((item) => ({
          quotation_id:
            savedQuotationId,
          description:
            item.description.trim(),
          quantity:
            toNumber(item.quantity),
          unit_price:
            toNumber(item.unitPrice),
          vat_rate:
            toNumber(item.vatRate),
          line_total:
            roundCurrency(
              toNumber(item.quantity) *
                toNumber(item.unitPrice),
            ),
          custom_values: Object.fromEntries(
            customColumns.map((column) => [
              column.key,
              (item.customValues?.[column.key] ?? "").trim(),
            ]),
          ),
        }));

      const {
        error: itemInsertError,
      } =
        await supabase
          .from("quotation_items")
          .insert(
            quotationItems,
          );

      if (itemInsertError) {
        if (createdQuotationId) {
          await supabase
            .from("quotations")
            .delete()
            .eq(
              "id",
              createdQuotationId,
            )
            .eq(
              "workspace_id",
              workspaceId,
            );
        }

        throw itemInsertError;
      }

      router.push(
        `/quotations/${savedQuotationId}`,
      );

      router.refresh();
    } catch (caughtError: unknown) {
      console.error(
        "Quotation save failed:",
        caughtError,
      );

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save the quotation.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    router.push(
      quotationId
        ? `/quotations/${quotationId}`
        : "/quotations",
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:p-8">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">
            Quotation details
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Select a client and define the quotation dates.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="client">
              Client *
            </Label>

            <select
              id="client"
              name="client"
              value={clientId}
              onChange={(event) =>
                setClientId(
                  event.target.value,
                )
              }
              disabled={isSaving}
              required
              className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">
                Select a client
              </option>

              {clients.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                >
                  {client.company_name ||
                    client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="issue_date">
              Issue date *
            </Label>

            <Input
              id="issue_date"
              name="issue_date"
              type="date"
              value={issueDate}
              onChange={(event) =>
                setIssueDate(
                  event.target.value,
                )
              }
              disabled={isSaving}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="valid_until">
              Valid until
            </Label>

            <Input
              id="valid_until"
              name="valid_until"
              type="date"
              value={validUntil}
              onChange={(event) =>
                setValidUntil(
                  event.target.value,
                )
              }
              disabled={isSaving}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Line items
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Add services or products included in this quotation.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            disabled={isSaving}
          >
            Add item
          </Button>
        </div>

        <div className="mb-6 rounded-xl border border-dashed border-border p-4">
          <p className="text-sm font-semibold">
            Extra columns
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Add your own columns, such as Unit, Duration or Warranty
            (up to {MAX_CUSTOM_COLUMNS}). They appear on every line item.
          </p>

          {customColumns.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {customColumns.map((column) => (
                <div
                  key={column.key}
                  className="flex items-center gap-2"
                >
                  <Input
                    type="text"
                    value={column.label}
                    maxLength={MAX_COLUMN_LABEL_LENGTH}
                    onChange={(event) =>
                      renameColumn(
                        column.key,
                        event.target.value,
                      )
                    }
                    disabled={isSaving}
                    aria-label="Column name"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeColumn(column.key)
                    }
                    disabled={isSaving}
                    className="shrink-0 text-sm text-red-600 hover:underline disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input
              type="text"
              placeholder="New column name"
              value={newColumnLabel}
              maxLength={MAX_COLUMN_LABEL_LENGTH}
              onChange={(event) =>
                setNewColumnLabel(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addColumn();
                }
              }}
              disabled={
                isSaving ||
                customColumns.length >=
                  MAX_CUSTOM_COLUMNS
              }
              className="sm:max-w-xs"
            />

            <Button
              type="button"
              variant="outline"
              onClick={addColumn}
              disabled={
                isSaving ||
                customColumns.length >=
                  MAX_CUSTOM_COLUMNS
              }
            >
              Add column
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={
                item.id ??
                `new-item-${index}`
              }
              className="rounded-xl border border-border p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold">
                  Item {index + 1}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    removeItem(index)
                  }
                  disabled={
                    items.length <= 1 ||
                    isSaving
                  }
                  className="text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-12">
                <div className="grid gap-2 md:col-span-6">
                  <Label
                    htmlFor={`description-${index}`}
                  >
                    Description *
                  </Label>

                  <Input
                    id={`description-${index}`}
                    name={`description-${index}`}
                    type="text"
                    placeholder="Website development"
                    value={item.description}
                    onChange={(event) =>
                      updateItem(
                        index,
                        "description",
                        event.target.value,
                      )
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label
                    htmlFor={`quantity-${index}`}
                  >
                    Quantity *
                  </Label>

                  <Input
                    id={`quantity-${index}`}
                    name={`quantity-${index}`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(
                        index,
                        "quantity",
                        event.target.value,
                      )
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label
                    htmlFor={`unit-price-${index}`}
                  >
                    Unit price *
                  </Label>

                  <Input
                    id={`unit-price-${index}`}
                    name={`unit-price-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(event) =>
                      updateItem(
                        index,
                        "unitPrice",
                        event.target.value,
                      )
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label
                    htmlFor={`vat-rate-${index}`}
                  >
                    VAT %
                  </Label>

                  <Input
                    id={`vat-rate-${index}`}
                    name={`vat-rate-${index}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={item.vatRate}
                    onChange={(event) =>
                      updateItem(
                        index,
                        "vatRate",
                        event.target.value,
                      )
                    }
                    disabled={isSaving}
                  />
                </div>
              </div>

              {customColumns.length > 0 && (
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {customColumns.map((column) => (
                    <div
                      key={column.key}
                      className="grid gap-2"
                    >
                      <Label
                        htmlFor={`${column.key}-${index}`}
                      >
                        {column.label.trim() ||
                          "Untitled column"}
                      </Label>

                      <Input
                        id={`${column.key}-${index}`}
                        name={`${column.key}-${index}`}
                        type="text"
                        value={
                          item.customValues?.[
                            column.key
                          ] ?? ""
                        }
                        onChange={(event) =>
                          updateCustomValue(
                            index,
                            column.key,
                            event.target.value,
                          )
                        }
                        disabled={isSaving}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:p-8">
          <div className="grid gap-2">
            <Label htmlFor="discount">
              Discount
            </Label>

            <Input
              id="discount"
              name="discount"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(event) =>
                setDiscount(
                  event.target.value,
                )
              }
              disabled={isSaving}
              className="max-w-xs"
            />
          </div>

          <div className="mt-5 grid gap-2">
            <Label htmlFor="notes">
              Notes
            </Label>

            <Textarea
              id="notes"
              name="notes"
              placeholder="Add notes, terms, or payment information."
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value,
                )
              }
              disabled={isSaving}
              rows={6}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:p-8">
          <h3 className="mb-5 text-lg font-semibold">
            Summary
          </h3>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Subtotal
              </dt>

              <dd>
                AED{" "}
                {totals.subtotal.toFixed(2)}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Discount
              </dt>

              <dd>
                AED{" "}
                {totals.discount.toFixed(2)}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                VAT
              </dt>

              <dd>
                AED{" "}
                {totals.vatAmount.toFixed(2)}
              </dd>
            </div>

            <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
              <dt>Total</dt>

              <dd className="text-zen-orange">
                AED{" "}
                {totals.total.toFixed(2)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSaving}
          className="bg-zen-orange text-white hover:bg-orange-600"
        >
          {isSaving
            ? "Saving..."
            : isEditing
              ? "Update quotation"
              : "Save quotation"}
        </Button>
      </div>
    </form>
  );
}