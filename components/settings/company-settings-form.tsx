"use client";

import { useActionState, type ReactNode } from "react";

import { saveCompanySettings } from "@/app/(portal)/settings/actions";
import {
  UAE_EMIRATES,
  type CompanySettingsValues,
  type SettingsFormState,
} from "@/app/(portal)/settings/types";
import { Button } from "@/components/ui/button";

type CompanySettingsFormProps = {
  initialValues: CompanySettingsValues;
  canEdit: boolean;
};

type FieldName = keyof CompanySettingsValues;

type SharedProps = {
  values: CompanySettingsValues;
  errors: SettingsFormState["fieldErrors"];
  disabled: boolean;
};

const initialState: SettingsFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

const inputClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-zen-orange focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50 disabled:text-muted-foreground";

/* ---------- Building blocks (defined outside the form on purpose) ---------- */

function FieldError({ message }: { message?: string }) {
  return message ? (
    <span className="text-xs text-red-600">{message}</span>
  ) : null;
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
  wide,
  values,
  errors,
  disabled,
}: SharedProps & {
  name: FieldName;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  wide?: boolean;
}) {
  return (
    <label className={`block space-y-1 ${wide ? "md:col-span-2" : ""}`}>
      <span className="text-sm font-medium">
        {label}
        {required && <span className="text-zen-orange"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        step={type === "number" ? "any" : undefined}
        defaultValue={values[name]}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputClass}
      />
      <FieldError message={errors[name]} />
    </label>
  );
}

function TextArea({
  name,
  label,
  values,
  disabled,
}: SharedProps & { name: FieldName; label: string }) {
  return (
    <label className="block space-y-1 md:col-span-2">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        name={name}
        rows={3}
        defaultValue={values[name]}
        disabled={disabled}
        className={inputClass}
      />
    </label>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h3 className="font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

/* ---------- Form ---------- */

export function CompanySettingsForm({
  initialValues,
  canEdit,
}: CompanySettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveCompanySettings,
    initialState,
  );

  // React resets the form after every submit. Feeding the submitted values
  // back in after an error keeps what the user typed.
  const values: CompanySettingsValues = {
    ...initialValues,
    ...(state.status === "error" ? state.values : {}),
  };

  const shared: SharedProps = {
    values,
    errors: state.fieldErrors,
    disabled: !canEdit,
  };

  return (
    <form action={formAction} className="space-y-6">
      {!canEdit && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You can view these settings. Only owners and admins can change them.
        </p>
      )}

      <Card title="Company">
        <Field {...shared} name="legal_name" label="Legal name" required />
        <Field {...shared} name="trading_name" label="Trading name" />
        <Field {...shared} name="email" label="Email" type="email" />
        <Field {...shared} name="phone" label="Phone" placeholder="+971 50 000 0000" />
        <Field {...shared} name="website" label="Website" placeholder="https://" />
        <Field {...shared} name="trn" label="TRN" placeholder="15 digits" />
      </Card>

      <Card
        title="Billing address"
        description="Shown in the From section of invoices and quotations."
      >
        <Field {...shared} name="address_line_1" label="Address line 1" placeholder="Office / building" wide />
        <Field {...shared} name="address_line_2" label="Address line 2" placeholder="Area / free zone" wide />
        <Field {...shared} name="city" label="City" />

        <label className="block space-y-1">
          <span className="text-sm font-medium">Emirate</span>
          <select
            name="emirate"
            defaultValue={values.emirate}
            disabled={shared.disabled}
            className={inputClass}
          >
            <option value="">Select emirate</option>
            {UAE_EMIRATES.map((emirate) => (
              <option key={emirate} value={emirate}>
                {emirate}
              </option>
            ))}
          </select>
        </label>

        <Field {...shared} name="postal_code" label="P.O. Box / postal code" />
        <Field {...shared} name="country" label="Country" />
      </Card>

      <Card title="Defaults">
        <Field {...shared} name="default_currency" label="Currency" />
        <Field {...shared} name="default_vat_rate" label="Default VAT rate (%)" type="number" />
        <Field {...shared} name="quotation_validity_days" label="Quotation validity (days)" type="number" />
      </Card>

      <Card title="Bank details" description="Shown under Payment details on invoices.">
        <Field {...shared} name="bank_name" label="Bank name" />
        <Field {...shared} name="bank_account_name" label="Account name" />
        <Field {...shared} name="bank_account_number" label="Account number" />
        <Field {...shared} name="iban" label="IBAN" />
        <Field {...shared} name="swift_code" label="SWIFT code" />
      </Card>

      <Card title="Document text">
        <TextArea {...shared} name="payment_terms" label="Payment terms" />
        <TextArea {...shared} name="invoice_footer" label="Invoice footer" />
        <TextArea {...shared} name="quotation_footer" label="Quotation footer" />
      </Card>

      <Card title="Authorized signatory">
        <Field {...shared} name="authorized_signatory_name" label="Name" />
        <Field {...shared} name="authorized_signatory_title" label="Title" />
        <Field {...shared} name="authorized_signatory_email" label="Email" type="email" />
      </Card>


      {canEdit && (
        <div className="sticky bottom-0 flex items-center justify-end gap-4 border-t border-border bg-white/90 py-4 backdrop-blur">
          {state.message && (
            <p
              role="status"
              className={`text-sm ${
                state.status === "success" ? "text-green-700" : "text-red-600"
              }`}
            >
              {state.message}
            </p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save settings"}
          </Button>
        </div>
      )}
    </form>
  );
}