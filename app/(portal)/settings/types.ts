export type CompanySettingsValues = {
  legal_name: string;
  trading_name: string;
  email: string;
  phone: string;
  website: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  emirate: string;
  postal_code: string;
  country: string;
  trn: string;
  default_currency: string;
  default_vat_rate: string;
  quotation_validity_days: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  iban: string;
  swift_code: string;
  payment_terms: string;
  invoice_footer: string;
  quotation_footer: string;
  authorized_signatory_name: string;
  authorized_signatory_title: string;
  authorized_signatory_email: string;
};

export type SettingsFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<keyof CompanySettingsValues, string>>;
  // What the user submitted, so the form keeps their input after an error
  values?: Partial<CompanySettingsValues>;
};

export const TEXT_FIELDS: (keyof CompanySettingsValues)[] = [
  "legal_name",
  "trading_name",
  "email",
  "phone",
  "website",
  "address_line_1",
  "address_line_2",
  "city",
  "emirate",
  "postal_code",
  "country",
  "trn",
  "default_currency",
  "bank_name",
  "bank_account_name",
  "bank_account_number",
  "iban",
  "swift_code",
  "payment_terms",
  "invoice_footer",
  "quotation_footer",
  "authorized_signatory_name",
  "authorized_signatory_title",
  "authorized_signatory_email",
];

export const UAE_EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];