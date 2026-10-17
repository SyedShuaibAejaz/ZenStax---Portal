"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type ClientFormValues = {
  name: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  trn: string;
  notes: string;
};

type ClientFormProps = {
  clientId?: string;
  initialValues?: ClientFormValues;
};

type WorkspaceMembership = {
  workspace_id: string;
  role: string;
};

const emptyForm: ClientFormValues = {
  name: "",
  company_name: "",
  email: "",
  phone: "",
  address: "",
  trn: "",
  notes: "",
};

export function ClientForm({
  clientId,
  initialValues = emptyForm,
}: ClientFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] =
    useState<ClientFormValues>(
      initialValues,
    );

  const [error, setError] =
    useState<string | null>(null);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isLoadingWorkspace, setIsLoadingWorkspace] =
    useState(true);

  const [membership, setMembership] =
    useState<WorkspaceMembership | null>(
      null,
    );

  const isEditing =
    Boolean(clientId);

  const role =
    membership?.role
      ?.toLowerCase() ?? "";

  const canEdit =
    role === "owner" ||
    role === "admin" ||
    role === "finance" ||
    role === "member";

  useEffect(() => {
    let mounted = true;

    async function loadWorkspaceMembership() {
      setIsLoadingWorkspace(true);
      setError(null);

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError || !user) {
        if (mounted) {
          setError(
            "Your session has expired. Please log in again.",
          );
          setIsLoadingWorkspace(false);
        }

        return;
      }

      const {
        data: currentMembership,
        error: membershipError,
      } =
        await supabase
          .from("workspace_members")
          .select("workspace_id, role")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: true,
          })
          .limit(1)
          .maybeSingle();

      if (
        membershipError ||
        !currentMembership
      ) {
        if (mounted) {
          setError(
            membershipError?.message ??
              "You are not assigned to a workspace.",
          );
          setIsLoadingWorkspace(false);
        }

        return;
      }

      if (mounted) {
        setMembership(
          currentMembership as WorkspaceMembership,
        );
        setIsLoadingWorkspace(false);
      }
    }

    loadWorkspaceMembership();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  function updateField(
    field: keyof ClientFormValues,
    value: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (isLoadingWorkspace) {
      setError(
        "Workspace information is still loading.",
      );
      return;
    }

    if (!membership) {
      setError(
        "You are not assigned to a workspace.",
      );
      return;
    }

    if (!canEdit) {
      setError(
        "You do not have permission to manage clients.",
      );
      return;
    }

    const trimmedName =
      form.name.trim();

    if (!trimmedName) {
      setError(
        "Contact name is required.",
      );
      return;
    }

    setIsSaving(true);

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

      const payload = {
        name: trimmedName,
        company_name:
          form.company_name.trim() || null,
        email:
          form.email.trim().toLowerCase() ||
          null,
        phone:
          form.phone.trim() || null,
        address:
          form.address.trim() || null,
        trn:
          form.trn.trim() || null,
        notes:
          form.notes.trim() || null,
        updated_at:
          new Date().toISOString(),
      };

      if (clientId) {
        const {
          error: updateError,
        } =
          await supabase
            .from("clients")
            .update(payload)
            .eq("id", clientId)
            .eq(
              "workspace_id",
              membership.workspace_id,
            );

        if (updateError) {
          throw updateError;
        }

        router.push(
          `/clients/${clientId}`,
        );
      } else {
        const {
          error: insertError,
        } =
          await supabase
            .from("clients")
            .insert({
              ...payload,
              workspace_id:
                membership.workspace_id,
              created_by: user.id,
            });

        if (insertError) {
          throw insertError;
        }

        router.push("/clients");
      }

      router.refresh();
    } catch (caughtError: unknown) {
      console.error(
        "Client save failed:",
        caughtError,
      );

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save the client.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    if (clientId) {
      router.push(
        `/clients/${clientId}`,
      );
    } else {
      router.push("/clients");
    }
  }

  const formDisabled =
    isSaving ||
    isLoadingWorkspace ||
    !canEdit;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm lg:p-8"
    >
      {!isLoadingWorkspace &&
        membership &&
        !canEdit && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            Your role is{" "}
            <strong className="capitalize">
              {role}
            </strong>
            . You can view clients, but you cannot
            create or edit them.
          </div>
        )}

      {isLoadingWorkspace && (
        <div className="rounded-lg border border-border bg-muted/45 px-4 py-3 text-sm text-muted-foreground">
          Loading workspace permissions...
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">
            Contact name{" "}
            <span className="text-red-500">
              *
            </span>
          </Label>

          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter contact name"
            autoComplete="name"
            value={form.name}
            onChange={(event) =>
              updateField(
                "name",
                event.target.value,
              )
            }
            disabled={formDisabled}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="company_name">
            Company name
          </Label>

          <Input
            id="company_name"
            name="company_name"
            type="text"
            placeholder="Enter company name"
            autoComplete="organization"
            value={form.company_name}
            onChange={(event) =>
              updateField(
                "company_name",
                event.target.value,
              )
            }
            disabled={formDisabled}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">
            Email
          </Label>

          <Input
            id="email"
            name="email"
            type="email"
            placeholder="client@example.com"
            autoComplete="email"
            value={form.email}
            onChange={(event) =>
              updateField(
                "email",
                event.target.value,
              )
            }
            disabled={formDisabled}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">
            Phone
          </Label>

          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+971 50 000 0000"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) =>
              updateField(
                "phone",
                event.target.value,
              )
            }
            disabled={formDisabled}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="trn">
            TRN
          </Label>

          <Input
            id="trn"
            name="trn"
            type="text"
            placeholder="Enter tax registration number"
            value={form.trn}
            onChange={(event) =>
              updateField(
                "trn",
                event.target.value,
              )
            }
            disabled={formDisabled}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="address">
          Address
        </Label>

        <Textarea
          id="address"
          name="address"
          placeholder="Enter billing or business address"
          autoComplete="street-address"
          value={form.address}
          onChange={(event) =>
            updateField(
              "address",
              event.target.value,
            )
          }
          disabled={formDisabled}
          rows={4}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">
          Notes
        </Label>

        <Textarea
          id="notes"
          name="notes"
          placeholder="Add internal notes about this client"
          value={form.notes}
          onChange={(event) =>
            updateField(
              "notes",
              event.target.value,
            )
          }
          disabled={formDisabled}
          rows={4}
        />
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

        {canEdit && (
          <Button
            type="submit"
            disabled={
              isSaving ||
              isLoadingWorkspace
            }
            className="bg-zen-orange text-white hover:bg-orange-600"
          >
            {isSaving
              ? "Saving..."
              : isEditing
                ? "Update client"
                : "Save client"}
          </Button>
        )}
      </div>
    </form>
  );
}