


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_role" AS ENUM (
    'owner',
    'partner'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."invoice_status" AS ENUM (
    'draft',
    'sent',
    'partially_paid',
    'paid',
    'overdue',
    'cancelled'
);


ALTER TYPE "public"."invoice_status" OWNER TO "postgres";


CREATE TYPE "public"."quotation_status" AS ENUM (
    'draft',
    'sent',
    'accepted',
    'rejected',
    'expired',
    'converted'
);


ALTER TYPE "public"."quotation_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_edit_company_settings"("p_workspace_id" "uuid", "p_user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = p_user_id
      and wm.role::text in ('owner', 'admin')
  );
$$;


ALTER FUNCTION "public"."can_edit_company_settings"("p_workspace_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_manage_members"("p_workspace_id" "uuid", "p_user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = p_user_id
      and wm.role::text in ('owner', 'admin')
  );
$$;


ALTER FUNCTION "public"."can_manage_members"("p_workspace_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_manage_workspace"("p_workspace_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;


ALTER FUNCTION "public"."can_manage_workspace"("p_workspace_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_manage_workspace"("p_workspace_id" "uuid", "p_user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = p_user_id
      and wm.role::text in ('owner', 'admin')
  );
$$;


ALTER FUNCTION "public"."can_manage_workspace"("p_workspace_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_workspace_ids"() RETURNS SETOF "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select workspace_id
  from public.workspace_members
  where user_id = auth.uid();
$$;


ALTER FUNCTION "public"."get_my_workspace_ids"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_workspace_role"("p_workspace_id" "uuid", "p_user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select wm.role::text
  from public.workspace_members wm
  where wm.workspace_id = p_workspace_id
    and wm.user_id = p_user_id
  limit 1;
$$;


ALTER FUNCTION "public"."get_workspace_role"("p_workspace_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'ZenStax User')
  );

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_workspace_admin"("requested_workspace_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id =
      requested_workspace_id
      and wm.user_id =
        (select auth.uid())
      and wm.role in (
        'owner',
        'admin',
        'finance'
      )
  );
$$;


ALTER FUNCTION "public"."is_workspace_admin"("requested_workspace_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_workspace_member"("requested_workspace_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id =
      requested_workspace_id
      and wm.user_id =
        (select auth.uid())
  );
$$;


ALTER FUNCTION "public"."is_workspace_member"("requested_workspace_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."next_invoice_number"() RETURNS "text"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select 'ZEN-INV-' || lpad(
    nextval('public.invoice_number_seq')::text,
    4,
    '0'
  );
$$;


ALTER FUNCTION "public"."next_invoice_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."next_quotation_number"() RETURNS "text"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select 'ZEN-QUO-' || lpad(
    nextval('public.quotation_number_seq')::text,
    4,
    '0'
  );
$$;


ALTER FUNCTION "public"."next_quotation_number"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_number" "text" NOT NULL,
    "quotation_id" "uuid",
    "client_id" "uuid" NOT NULL,
    "issue_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "due_date" "date",
    "status" "public"."invoice_status" DEFAULT 'draft'::"public"."invoice_status" NOT NULL,
    "currency" "text" DEFAULT 'AED'::"text" NOT NULL,
    "subtotal" numeric(12,2) DEFAULT 0 NOT NULL,
    "discount" numeric(12,2) DEFAULT 0 NOT NULL,
    "vat_amount" numeric(12,2) DEFAULT 0 NOT NULL,
    "total" numeric(12,2) DEFAULT 0 NOT NULL,
    "amount_paid" numeric(12,2) DEFAULT 0 NOT NULL,
    "notes" "text",
    "pdf_path" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "payment_provider" "text",
    "payment_checkout_id" "text",
    "payment_url" "text",
    "payment_expires_at" timestamp with time zone
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_invoice_payment_status"("p_invoice_id" "uuid") RETURNS "public"."invoices"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  invoice_row public.invoices;
  paid_total numeric(12, 2);
begin
  select
    coalesce(sum(amount), 0)
  into paid_total
  from public.payments
  where invoice_id = p_invoice_id;

  update public.invoices
  set
    amount_paid = paid_total,
    status = case
      when paid_total >= total then 'paid'
      when paid_total > 0 then 'partially_paid'
      else status
    end,
    updated_at = now()
  where id = p_invoice_id
  returning * into invoice_row;

  return invoice_row;
end;
$$;


ALTER FUNCTION "public"."refresh_invoice_payment_status"("p_invoice_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."remove_workspace_member"("p_workspace_id" "uuid", "p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  target_role text;
begin
  if not public.can_manage_workspace(p_workspace_id) then
    raise exception 'Only workspace owners or admins can remove members';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot remove yourself';
  end if;

  select role
  into target_role
  from public.workspace_members
  where workspace_id = p_workspace_id
    and user_id = p_user_id;

  if target_role is null then
    raise exception 'Member not found';
  end if;

  if target_role = 'owner' then
    raise exception 'Transfer ownership before removing an owner';
  end if;

  delete from public.member_permissions
  where workspace_id = p_workspace_id
    and user_id = p_user_id;

  delete from public.workspace_members
  where workspace_id = p_workspace_id
    and user_id = p_user_id;
end;
$$;


ALTER FUNCTION "public"."remove_workspace_member"("p_workspace_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."member_permissions" (
    "workspace_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "permission_key" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."member_permissions" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."replace_member_permissions"("p_workspace_id" "uuid", "p_user_id" "uuid", "p_permissions" "text"[]) RETURNS SETOF "public"."member_permissions"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if not public.can_manage_workspace(p_workspace_id) then
    raise exception 'Only workspace owners or admins can manage permissions';
  end if;

  if not exists (
    select 1
    from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = p_user_id
  ) then
    raise exception 'Member not found';
  end if;

  delete from public.member_permissions
  where workspace_id = p_workspace_id
    and user_id = p_user_id;

  insert into public.member_permissions (
    workspace_id,
    user_id,
    permission_key
  )
  select
    p_workspace_id,
    p_user_id,
    permission_key
  from unnest(p_permissions) as permission_key
  where exists (
    select 1
    from public.workspace_permissions
    where workspace_id = p_workspace_id
      and workspace_permissions.permission_key = permission_key
  );

  return query
  select *
  from public.member_permissions
  where workspace_id = p_workspace_id
    and user_id = p_user_id
  order by permission_key;
end;
$$;


ALTER FUNCTION "public"."replace_member_permissions"("p_workspace_id" "uuid", "p_user_id" "uuid", "p_permissions" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_members" (
    "workspace_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."workspace_members" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_workspace_member_role"("p_workspace_id" "uuid", "p_user_id" "uuid", "p_role" "text") RETURNS "public"."workspace_members"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  updated_member public.workspace_members;
  target_role text;
begin
  if not public.can_manage_workspace(p_workspace_id) then
    raise exception 'Only workspace owners or admins can manage members';
  end if;

  if p_role not in (
    'owner',
    'admin',
    'finance',
    'member',
    'viewer'
  ) then
    raise exception 'Invalid workspace role';
  end if;

  select role
  into target_role
  from public.workspace_members
  where workspace_id = p_workspace_id
    and user_id = p_user_id;

  if target_role is null then
    raise exception 'Member not found';
  end if;

  if target_role = 'owner'
     and p_role <> 'owner'
     and not exists (
       select 1
       from public.workspace_members
       where workspace_id = p_workspace_id
         and role = 'owner'
         and user_id <> p_user_id
     ) then
    raise exception 'The workspace must always have an owner';
  end if;

  update public.workspace_members
  set role = p_role
  where workspace_id = p_workspace_id
    and user_id = p_user_id
  returning * into updated_member;

  return updated_member;
end;
$$;


ALTER FUNCTION "public"."update_workspace_member_role"("p_workspace_id" "uuid", "p_user_id" "uuid", "p_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."write_audit_log"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  affected_row jsonb;
  workspace_id_value uuid;
  entity_id_value text;
begin
  if TG_OP = 'DELETE' then
    affected_row := to_jsonb(OLD);
  else
    affected_row := to_jsonb(NEW);
  end if;

  /*
   * Tables such as workspace_members and documents
   * contain workspace_id directly.
   */
  if affected_row ? 'workspace_id' then
    begin
      workspace_id_value :=
        nullif(
          affected_row ->> 'workspace_id',
          ''
        )::uuid;
    exception
      when invalid_text_representation then
        workspace_id_value := null;
    end;
  end if;

  /*
   * The workspaces table uses id as its workspace ID.
   */
  if workspace_id_value is null
     and TG_TABLE_NAME = 'workspaces'
     and affected_row ? 'id' then
    begin
      workspace_id_value :=
        (affected_row ->> 'id')::uuid;
    exception
      when invalid_text_representation then
        workspace_id_value := null;
    end;
  end if;

  if affected_row ? 'id' then
    entity_id_value :=
      affected_row ->> 'id';
  elsif affected_row ? 'user_id' then
    entity_id_value :=
      affected_row ->> 'user_id';
  elsif affected_row ? 'workspace_id' then
    entity_id_value :=
      affected_row ->> 'workspace_id';
  end if;

  insert into public.audit_logs (
    workspace_id,
    user_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data,
    metadata
  )
  values (
    workspace_id_value,
    auth.uid(),
    lower(TG_OP),
    TG_TABLE_NAME,
    entity_id_value,
    case
      when TG_OP in ('UPDATE', 'DELETE')
        then to_jsonb(OLD)
      else null
    end,
    case
      when TG_OP in ('INSERT', 'UPDATE')
        then to_jsonb(NEW)
      else null
    end,
    jsonb_build_object(
      'schema',
      TG_TABLE_SCHEMA,
      'table',
      TG_TABLE_NAME
    )
  );

  if TG_OP = 'DELETE' then
    return OLD;
  end if;

  return NEW;
end;
$$;


ALTER FUNCTION "public"."write_audit_log"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "entity_type" "text",
    "entity_id" "uuid",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid",
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "text",
    "old_data" "jsonb",
    "new_data" "jsonb",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."business_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_name" "text" DEFAULT 'ZenStax'::"text" NOT NULL,
    "legal_name" "text",
    "logo_path" "text",
    "address" "text",
    "email" "text",
    "phone" "text",
    "website" "text",
    "trn" "text",
    "default_currency" "text" DEFAULT 'AED'::"text" NOT NULL,
    "default_vat_rate" numeric(5,2) DEFAULT 5 NOT NULL,
    "invoice_prefix" "text" DEFAULT 'ZEN-INV-'::"text" NOT NULL,
    "quotation_prefix" "text" DEFAULT 'ZEN-QUO-'::"text" NOT NULL,
    "bank_details" "text",
    "terms_and_conditions" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."business_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "company_name" "text",
    "email" "text",
    "phone" "text",
    "address" "text",
    "trn" "text",
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "workspace_id" "uuid" NOT NULL
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid",
    "legal_name" "text" DEFAULT 'ZenStax'::"text" NOT NULL,
    "trading_name" "text",
    "logo_path" "text",
    "email" "text",
    "phone" "text",
    "website" "text",
    "address_line_1" "text",
    "address_line_2" "text",
    "city" "text",
    "emirate" "text",
    "country" "text" DEFAULT 'United Arab Emirates'::"text" NOT NULL,
    "postal_code" "text",
    "trn" "text",
    "default_currency" "text" DEFAULT 'AED'::"text" NOT NULL,
    "default_vat_rate" numeric(5,2) DEFAULT 5.00 NOT NULL,
    "bank_name" "text",
    "bank_account_name" "text",
    "bank_account_number" "text",
    "iban" "text",
    "swift_code" "text",
    "payment_terms" "text" DEFAULT 'Payment due within 30 days.'::"text",
    "quotation_validity_days" integer DEFAULT 7 NOT NULL,
    "invoice_footer" "text",
    "quotation_footer" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "authorized_signatory_name" "text",
    "authorized_signatory_title" "text",
    "authorized_signatory_email" "text",
    "brand_primary_color" "text" DEFAULT '#FF7425'::"text",
    "brand_secondary_color" "text" DEFAULT '#071B31'::"text",
    CONSTRAINT "company_settings_validity_check" CHECK (("quotation_validity_days" > 0)),
    CONSTRAINT "company_settings_vat_rate_check" CHECK ((("default_vat_rate" >= (0)::numeric) AND ("default_vat_rate" <= (100)::numeric)))
);


ALTER TABLE "public"."company_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."credit_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "credit_note_number" "text" NOT NULL,
    "invoice_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "issue_date" "date" NOT NULL,
    "reason" "text" NOT NULL,
    "subtotal" numeric(12,2) DEFAULT 0 NOT NULL,
    "vat_amount" numeric(12,2) DEFAULT 0 NOT NULL,
    "total" numeric(12,2) DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "credit_notes_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'issued'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."credit_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "uploaded_by" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "category" "text" DEFAULT 'Other'::"text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "mime_type" "text" NOT NULL,
    "file_size" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "category" "text",
    "expense_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoice_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "quantity" numeric(12,2) DEFAULT 1 NOT NULL,
    "unit_price" numeric(12,2) DEFAULT 0 NOT NULL,
    "vat_rate" numeric(5,2) DEFAULT 5 NOT NULL,
    "line_total" numeric(12,2) DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."invoice_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."invoice_number_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."invoice_number_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoice_payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "invoice_id" "uuid" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "payment_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "payment_method" "text" DEFAULT 'bank_transfer'::"text" NOT NULL,
    "reference" "text",
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "provider" "text",
    "provider_payment_id" "text",
    "provider_event_id" "text",
    "provider_fee" numeric(12,2),
    "raw_data" "jsonb",
    CONSTRAINT "invoice_payments_amount_check" CHECK (("amount" > (0)::numeric))
);


ALTER TABLE "public"."invoice_payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_id" "uuid" NOT NULL,
    "payment_date" "date" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "method" "text" NOT NULL,
    "reference" "text",
    "notes" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "payments_method_check" CHECK (("method" = ANY (ARRAY['cash'::"text", 'bank_transfer'::"text", 'card'::"text", 'cheque'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "role" "public"."app_role" DEFAULT 'partner'::"public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quotation_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "quotation_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "quantity" numeric(12,2) DEFAULT 1 NOT NULL,
    "unit_price" numeric(12,2) DEFAULT 0 NOT NULL,
    "vat_rate" numeric(5,2) DEFAULT 5 NOT NULL,
    "line_total" numeric(12,2) DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."quotation_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."quotation_number_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."quotation_number_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quotations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "quotation_number" "text" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "issue_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "valid_until" "date",
    "status" "public"."quotation_status" DEFAULT 'draft'::"public"."quotation_status" NOT NULL,
    "currency" "text" DEFAULT 'AED'::"text" NOT NULL,
    "subtotal" numeric(12,2) DEFAULT 0 NOT NULL,
    "discount" numeric(12,2) DEFAULT 0 NOT NULL,
    "vat_amount" numeric(12,2) DEFAULT 0 NOT NULL,
    "total" numeric(12,2) DEFAULT 0 NOT NULL,
    "notes" "text",
    "pdf_path" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "workspace_id" "uuid" NOT NULL
);


ALTER TABLE "public"."quotations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "permission_key" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."workspace_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspaces" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "legal_name" "text",
    "phone" "text",
    "email" "text",
    "address" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "logo_url" "text",
    "primary_color" "text" DEFAULT '#FF7425'::"text",
    "secondary_color" "text" DEFAULT '#071B31'::"text"
);


ALTER TABLE "public"."workspaces" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."business_settings"
    ADD CONSTRAINT "business_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_settings"
    ADD CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_settings"
    ADD CONSTRAINT "company_settings_workspace_unique" UNIQUE ("workspace_id");



ALTER TABLE ONLY "public"."credit_notes"
    ADD CONSTRAINT "credit_notes_credit_note_number_key" UNIQUE ("credit_note_number");



ALTER TABLE ONLY "public"."credit_notes"
    ADD CONSTRAINT "credit_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoice_payments"
    ADD CONSTRAINT "invoice_payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_invoice_number_key" UNIQUE ("invoice_number");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."member_permissions"
    ADD CONSTRAINT "member_permissions_pkey" PRIMARY KEY ("workspace_id", "user_id", "permission_key");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotation_items"
    ADD CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotations"
    ADD CONSTRAINT "quotations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotations"
    ADD CONSTRAINT "quotations_quotation_number_key" UNIQUE ("quotation_number");



ALTER TABLE ONLY "public"."workspace_members"
    ADD CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("workspace_id", "user_id");



ALTER TABLE ONLY "public"."workspace_members"
    ADD CONSTRAINT "workspace_members_workspace_id_user_id_key" UNIQUE ("workspace_id", "user_id");



ALTER TABLE ONLY "public"."workspace_permissions"
    ADD CONSTRAINT "workspace_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workspace_permissions"
    ADD CONSTRAINT "workspace_permissions_workspace_id_permission_key_key" UNIQUE ("workspace_id", "permission_key");



ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id");



CREATE INDEX "audit_logs_created_at_idx" ON "public"."audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "audit_logs_entity_type_idx" ON "public"."audit_logs" USING "btree" ("entity_type");



CREATE INDEX "audit_logs_workspace_id_idx" ON "public"."audit_logs" USING "btree" ("workspace_id");



CREATE INDEX "clients_workspace_id_idx" ON "public"."clients" USING "btree" ("workspace_id");



CREATE INDEX "documents_category_idx" ON "public"."documents" USING "btree" ("category");



CREATE INDEX "documents_created_at_idx" ON "public"."documents" USING "btree" ("created_at" DESC);



CREATE INDEX "documents_workspace_id_idx" ON "public"."documents" USING "btree" ("workspace_id");



CREATE UNIQUE INDEX "invoice_payments_provider_event_id_idx" ON "public"."invoice_payments" USING "btree" ("provider_event_id") WHERE ("provider_event_id" IS NOT NULL);



CREATE INDEX "invoices_workspace_id_idx" ON "public"."invoices" USING "btree" ("workspace_id");



CREATE INDEX "member_permissions_lookup_idx" ON "public"."member_permissions" USING "btree" ("workspace_id", "user_id");



CREATE INDEX "quotations_workspace_id_idx" ON "public"."quotations" USING "btree" ("workspace_id");



CREATE INDEX "workspace_permissions_lookup_idx" ON "public"."workspace_permissions" USING "btree" ("workspace_id");



CREATE OR REPLACE TRIGGER "audit_documents" AFTER INSERT OR DELETE OR UPDATE ON "public"."documents" FOR EACH ROW EXECUTE FUNCTION "public"."write_audit_log"();



CREATE OR REPLACE TRIGGER "audit_expenses" AFTER INSERT OR DELETE OR UPDATE ON "public"."expenses" FOR EACH ROW EXECUTE FUNCTION "public"."write_audit_log"();



CREATE OR REPLACE TRIGGER "audit_profiles" AFTER INSERT OR DELETE OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."write_audit_log"();



CREATE OR REPLACE TRIGGER "audit_workspace_members" AFTER INSERT OR DELETE OR UPDATE ON "public"."workspace_members" FOR EACH ROW EXECUTE FUNCTION "public"."write_audit_log"();



CREATE OR REPLACE TRIGGER "audit_workspaces" AFTER INSERT OR DELETE OR UPDATE ON "public"."workspaces" FOR EACH ROW EXECUTE FUNCTION "public"."write_audit_log"();



CREATE OR REPLACE TRIGGER "company_settings_set_updated_at" BEFORE UPDATE ON "public"."company_settings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_settings"
    ADD CONSTRAINT "company_settings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."credit_notes"
    ADD CONSTRAINT "credit_notes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id");



ALTER TABLE ONLY "public"."credit_notes"
    ADD CONSTRAINT "credit_notes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."credit_notes"
    ADD CONSTRAINT "credit_notes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_payments"
    ADD CONSTRAINT "invoice_payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoice_payments"
    ADD CONSTRAINT "invoice_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_payments"
    ADD CONSTRAINT "invoice_payments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."member_permissions"
    ADD CONSTRAINT "member_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."member_permissions"
    ADD CONSTRAINT "member_permissions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotation_items"
    ADD CONSTRAINT "quotation_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotations"
    ADD CONSTRAINT "quotations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id");



ALTER TABLE ONLY "public"."quotations"
    ADD CONSTRAINT "quotations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."quotations"
    ADD CONSTRAINT "quotations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_members"
    ADD CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."workspace_permissions"
    ADD CONSTRAINT "workspace_permissions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "workspaces_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



CREATE POLICY "Authenticated users can delete clients" ON "public"."clients" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can delete invoice items" ON "public"."invoice_items" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can delete invoices" ON "public"."invoices" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can delete quotation items" ON "public"."quotation_items" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can delete quotations" ON "public"."quotations" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can insert clients" ON "public"."clients" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert company settings" ON "public"."company_settings" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert invoice items" ON "public"."invoice_items" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert invoices" ON "public"."invoices" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert quotation items" ON "public"."quotation_items" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert quotations" ON "public"."quotations" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can read clients" ON "public"."clients" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read invoice items" ON "public"."invoice_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read invoices" ON "public"."invoices" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read quotation items" ON "public"."quotation_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read quotations" ON "public"."quotations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can update clients" ON "public"."clients" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can update company settings" ON "public"."company_settings" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can update invoice items" ON "public"."invoice_items" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can update invoices" ON "public"."invoices" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can update quotation items" ON "public"."quotation_items" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can update quotations" ON "public"."quotations" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can view company settings" ON "public"."company_settings" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authorized users can create documents" ON "public"."documents" FOR INSERT TO "authenticated" WITH CHECK ((("uploaded_by" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "documents"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("wm"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'finance'::"text"])))))));



CREATE POLICY "Authorized users can create invoices" ON "public"."invoices" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "invoices"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("wm"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'finance'::"text"])))))));



CREATE POLICY "Members can view member permissions" ON "public"."member_permissions" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "public"."get_my_workspace_ids"() AS "get_my_workspace_ids")));



CREATE POLICY "Members can view workspace permissions" ON "public"."workspace_permissions" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "public"."get_my_workspace_ids"() AS "get_my_workspace_ids")));



CREATE POLICY "Owners and admins can delete documents" ON "public"."documents" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "documents"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("wm"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Owners and admins can update documents" ON "public"."documents" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "documents"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("wm"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "documents"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("wm"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Owners and admins can update workspace" ON "public"."workspaces" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "workspaces"."id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("wm"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "workspaces"."id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("wm"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Owners and admins can view audit logs" ON "public"."audit_logs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "audit_logs"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("wm"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Owners can manage memberships" ON "public"."workspace_members" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "manager"
  WHERE (("manager"."workspace_id" = "workspace_members"."workspace_id") AND ("manager"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("manager"."role" = 'owner'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "manager"
  WHERE (("manager"."workspace_id" = "workspace_members"."workspace_id") AND ("manager"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("manager"."role" = 'owner'::"text")))));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view workspace members" ON "public"."workspace_members" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "public"."get_my_workspace_ids"() AS "get_my_workspace_ids")));



CREATE POLICY "Workspace admins can delete documents" ON "public"."documents" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "documents"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("wm"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Workspace admins can update documents" ON "public"."documents" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "documents"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("wm"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "documents"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("wm"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Workspace members can create documents" ON "public"."documents" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "documents"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) AND ("uploaded_by" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Workspace members can view clients" ON "public"."clients" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "clients"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Workspace members can view company settings" ON "public"."company_settings" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "company_settings"."workspace_id") AND ("wm"."user_id" = "auth"."uid"())))));



CREATE POLICY "Workspace members can view documents" ON "public"."documents" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "documents"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Workspace members can view invoices" ON "public"."invoices" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "invoices"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Workspace members can view quotations" ON "public"."quotations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "quotations"."workspace_id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Workspace members can view workspace" ON "public"."workspaces" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."workspace_members" "wm"
  WHERE (("wm"."workspace_id" = "workspaces"."id") AND ("wm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "authenticated users can create activity logs" ON "public"."activity_logs" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "authenticated users can manage business settings" ON "public"."business_settings" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "authenticated users can manage clients" ON "public"."clients" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "authenticated users can manage invoice items" ON "public"."invoice_items" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "authenticated users can manage invoices" ON "public"."invoices" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "authenticated users can manage quotation items" ON "public"."quotation_items" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "authenticated users can manage quotations" ON "public"."quotations" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "authenticated users can read activity logs" ON "public"."activity_logs" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated users can read profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."business_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."credit_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoice_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoice_payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."member_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quotation_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quotations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



ALTER TABLE "public"."workspace_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workspace_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workspaces" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































REVOKE ALL ON FUNCTION "public"."can_edit_company_settings"("p_workspace_id" "uuid", "p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_edit_company_settings"("p_workspace_id" "uuid", "p_user_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."can_manage_members"("p_workspace_id" "uuid", "p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_manage_members"("p_workspace_id" "uuid", "p_user_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."can_manage_workspace"("p_workspace_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_manage_workspace"("p_workspace_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."can_manage_workspace"("p_workspace_id" "uuid", "p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_manage_workspace"("p_workspace_id" "uuid", "p_user_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."get_my_workspace_ids"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_my_workspace_ids"() TO "authenticated";



REVOKE ALL ON FUNCTION "public"."get_workspace_role"("p_workspace_id" "uuid", "p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_workspace_role"("p_workspace_id" "uuid", "p_user_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."is_workspace_admin"("requested_workspace_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_workspace_admin"("requested_workspace_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."is_workspace_member"("requested_workspace_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_workspace_member"("requested_workspace_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."next_invoice_number"() TO "authenticated";



GRANT ALL ON FUNCTION "public"."next_quotation_number"() TO "authenticated";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."invoices" TO "service_role";



REVOKE ALL ON FUNCTION "public"."remove_workspace_member"("p_workspace_id" "uuid", "p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."remove_workspace_member"("p_workspace_id" "uuid", "p_user_id" "uuid") TO "authenticated";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."member_permissions" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."member_permissions" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."member_permissions" TO "service_role";



REVOKE ALL ON FUNCTION "public"."replace_member_permissions"("p_workspace_id" "uuid", "p_user_id" "uuid", "p_permissions" "text"[]) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."replace_member_permissions"("p_workspace_id" "uuid", "p_user_id" "uuid", "p_permissions" "text"[]) TO "authenticated";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspace_members" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspace_members" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."workspace_members" TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_workspace_member_role"("p_workspace_id" "uuid", "p_user_id" "uuid", "p_role" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_workspace_member_role"("p_workspace_id" "uuid", "p_user_id" "uuid", "p_role" "text") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."write_audit_log"() FROM PUBLIC;


















GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."activity_logs" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."activity_logs" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."activity_logs" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."audit_logs" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."audit_logs" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."audit_logs" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."business_settings" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."business_settings" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."business_settings" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."clients" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."company_settings" TO "anon";
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."company_settings" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."company_settings" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."credit_notes" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."credit_notes" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."credit_notes" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."expenses" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."expenses" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."expenses" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."invoice_items" TO "anon";
GRANT ALL ON TABLE "public"."invoice_items" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."invoice_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."invoice_number_seq" TO "authenticated";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."invoice_payments" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."invoice_payments" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."invoice_payments" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."payments" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."payments" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."payments" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."profiles" TO "anon";
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."profiles" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."profiles" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."quotation_items" TO "anon";
GRANT ALL ON TABLE "public"."quotation_items" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."quotation_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."quotation_number_seq" TO "authenticated";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."quotations" TO "anon";
GRANT ALL ON TABLE "public"."quotations" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."quotations" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspace_permissions" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspace_permissions" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspace_permissions" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspaces" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspaces" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."workspaces" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "service_role";



































