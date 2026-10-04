"use client";

import {
  ChangeEvent,
  FormEvent,
  useState,
} from "react";

type BrandingSettingsFormProps = {
  workspaceId: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  role: string;
  canEdit: boolean;
};

export default function BrandingSettingsForm({
  workspaceId,
  logoUrl,
  primaryColor,
  secondaryColor,
  role,
  canEdit,
}: BrandingSettingsFormProps) {
  const [logoPreview, setLogoPreview] =
    useState(logoUrl ?? "");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [primary, setPrimary] =
    useState(primaryColor || "#FF7425");

  const [secondary, setSecondary] =
    useState(
      secondaryColor || "#071B31",
    );

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    if (!canEdit) {
      return;
    }

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select an image file.",
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(
        "Logo must be smaller than 2 MB.",
      );
      return;
    }

    setError("");
    setSelectedFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setLogoPreview(previewUrl);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!canEdit) {
      setError(
        "You do not have permission to edit branding.",
      );
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const formData =
        new FormData();

      formData.append(
        "workspaceId",
        workspaceId,
      );

      formData.append(
        "primaryColor",
        primary,
      );

      formData.append(
        "secondaryColor",
        secondary,
      );

      if (selectedFile) {
        formData.append(
          "logo",
          selectedFile,
        );
      }

      const response =
        await fetch(
          "/api/workspace/branding",
          {
            method: "PATCH",
            body: formData,
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          error?: string;
          logoUrl?: string;
        };

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Could not save branding.",
        );
      }

      if (result.logoUrl) {
        setLogoPreview(
          `${result.logoUrl}?v=${Date.now()}`,
        );
      }

      setSelectedFile(null);

      setMessage(
        "Branding saved successfully.",
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save branding.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#FF7425]">
              Workspace identity
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#071B31]">
              Branding
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Customize the logo and colors used in your
              workspace.
            </p>
          </div>

          <span
            className={[
              "inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold",
              canEdit
                ? "bg-green-50 text-green-700"
                : "bg-slate-100 text-slate-500",
            ].join(" ")}
          >
            {canEdit
              ? "Editing enabled"
              : "View only"}
          </span>
        </div>
      </div>

      {!canEdit && (
        <div className="mx-6 mt-6 rounded-2xl border border-[#CDE5F5] bg-[#F0F8FD] p-4 text-sm leading-6 text-[#24516C] sm:mx-8">
          Your role is{" "}
          <strong>{role}</strong>. Only owners and
          administrators can change workspace branding.
        </div>
      )}

      {message && (
        <div className="mx-6 mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 sm:mx-8">
          {message}
        </div>
      )}

      {error && (
        <div className="mx-6 mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:mx-8">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-8 p-6 sm:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <div>
            <p className="text-sm font-semibold text-[#071B31]">
              Company logo
            </p>

            <div className="mt-3 flex h-44 w-44 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Company logo preview"
                  className="max-h-full max-w-full object-contain p-4"
                />
              ) : (
                <span className="px-5 text-center text-sm text-slate-400">
                  No logo uploaded
                </span>
              )}
            </div>

            {canEdit && (
              <label className="mt-4 inline-flex cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#071B31] transition hover:border-[#FF7425] hover:text-[#E85E17]">
                Choose logo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}

            <p className="mt-3 text-xs leading-5 text-slate-400">
              PNG, JPG, WEBP, or SVG. Maximum size: 2 MB.
            </p>
          </div>

          <div className="space-y-6">
            <ColorField
              label="Primary color"
              value={primary}
              disabled={!canEdit}
              onChange={setPrimary}
            />

            <ColorField
              label="Secondary color"
              value={secondary}
              disabled={!canEdit}
              onChange={setSecondary}
            />

            <div
              className="rounded-2xl border border-slate-200 p-5"
              style={{
                backgroundColor: secondary,
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.16em]"
                style={{
                  color: primary,
                }}
              >
                Live preview
              </p>

              <h3 className="mt-2 text-xl font-semibold text-white">
                Your workspace
              </h3>

              <button
                type="button"
                className="mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                style={{
                  backgroundColor: primary,
                }}
              >
                Primary action
              </button>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end border-t border-slate-100 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#FF7425] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF7425]/20 transition hover:bg-[#E85E17] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving branding..."
                : "Save branding"}
            </button>
          </div>
        )}
      </form>
    </section>
  );
}

function ColorField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#071B31]">
        {label}
      </label>

      <div className="flex gap-3">
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-12 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <input
          type="text"
          value={value}
          disabled={disabled}
          maxLength={7}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={[
            "flex-1 rounded-xl border px-4 py-3 text-sm uppercase outline-none",
            disabled
              ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
              : "border-slate-200 bg-slate-50 text-[#071B31] focus:border-[#FF7425] focus:bg-white focus:ring-4 focus:ring-[#FF7425]/10",
          ].join(" ")}
        />
      </div>
    </div>
  );
}