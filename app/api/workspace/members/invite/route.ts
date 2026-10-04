import { NextResponse } from "next/server";
import {
  createClient as createSupabaseAdminClient,
} from "@supabase/supabase-js";
import nodemailer from "nodemailer";

import { createClient } from "@/lib/supabase/server";

type MemberRole =
  | "owner"
  | "admin"
  | "finance"
  | "member"
  | "viewer";

type InviteRequest = {
  workspaceId?: string;
  email?: string;
  role?: MemberRole;
};

const allowedRoles: MemberRole[] = [
  "owner",
  "admin",
  "finance",
  "member",
  "viewer",
];

function jsonError(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}

function createAdminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing.",
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing.",
    );
  }

  return createSupabaseAdminClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

function createTransporter() {
  const host =
    process.env.SMTP_HOST?.trim();

  const port = Number(
    process.env.SMTP_PORT ?? "587",
  );

  const secure =
    process.env.SMTP_SECURE === "true";

  const user =
    process.env.SMTP_USER?.trim();

  const password =
    process.env.SMTP_PASSWORD;

  if (!host) {
    throw new Error(
      "SMTP_HOST is missing.",
    );
  }

  if (!user) {
    throw new Error(
      "SMTP_USER is missing.",
    );
  }

  if (!password) {
    throw new Error(
      "SMTP_PASSWORD is missing.",
    );
  }

  if (
    !Number.isInteger(port) ||
    port <= 0
  ) {
    throw new Error(
      "SMTP_PORT must be a valid number.",
    );
  }

  if (port === 465 && !secure) {
    throw new Error(
      "SMTP port 465 requires SMTP_SECURE=true.",
    );
  }

  if (port !== 465 && secure) {
    throw new Error(
      "SMTP_SECURE should normally be false for port 587.",
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass: password,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createProfileName(email: string) {
  const name = email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .trim();

  return name || "Workspace member";
}

function buildPasswordRedirectUrl() {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  ).replace(/\/+$/, "");

  return `${siteUrl}/set-password`;
}

function forceRedirectUrl(
  actionLink: string,
  redirectUrl: string,
) {
  const url = new URL(actionLink);

  url.searchParams.set(
    "redirect_to",
    redirectUrl,
  );

  return url.toString();
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as InviteRequest;

    const workspaceId =
      body.workspaceId?.trim();

    const email =
      body.email?.trim().toLowerCase();

    const role = body.role;

    if (!workspaceId) {
      return jsonError(
        "Workspace ID is required.",
        400,
      );
    }

    if (!email) {
      return jsonError(
        "Email address is required.",
        400,
      );
    }

    if (!role || !allowedRoles.includes(role)) {
      return jsonError(
        "A valid member role is required.",
        400,
      );
    }

    const supabase = await createClient();

    const {
      data: {
        user: currentUser,
      },
      error: currentUserError,
    } = await supabase.auth.getUser();

    if (currentUserError || !currentUser) {
      return jsonError(
        "Unauthorized.",
        401,
      );
    }

    const {
      data: canManage,
      error: permissionError,
    } = await supabase.rpc(
      "can_manage_workspace",
      {
        p_workspace_id: workspaceId,
      },
    );

    if (permissionError) {
      console.error(
        "Workspace permission check failed:",
        permissionError,
      );

      return jsonError(
        permissionError.message,
        500,
      );
    }

    if (!canManage) {
      return jsonError(
        "Only workspace owners and admins can invite members.",
        403,
      );
    }

    const adminSupabase =
      createAdminClient();

    let invitedUserId: string;
    let isExistingUser = false;

    const {
      data: userList,
      error: userListError,
    } =
      await adminSupabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (userListError) {
      console.error(
        "Could not list Auth users:",
        userListError,
      );

      return jsonError(
        userListError.message,
        500,
      );
    }

    const existingUser =
      userList.users.find(
        (user) =>
          user.email?.toLowerCase() === email,
      );

    if (existingUser) {
      invitedUserId = existingUser.id;
      isExistingUser = true;
    } else {
      /*
       * This is only an internal password.
       * It is never sent to the user.
       */
      const internalPassword =
        `${crypto.randomUUID()}Aa1!`;

      const {
        data: createdUser,
        error: createUserError,
      } =
        await adminSupabase.auth.admin.createUser(
          {
            email,
            password: internalPassword,
            email_confirm: true,
            user_metadata: {
              invited_workspace_id:
                workspaceId,
              invited_role: role,
              invited_by: currentUser.id,
            },
          },
        );

      if (
        createUserError ||
        !createdUser.user
      ) {
        console.error(
          "Could not create Auth user:",
          createUserError,
        );

        return jsonError(
          createUserError?.message ??
            "Could not create invited user.",
          500,
        );
      }

      invitedUserId =
        createdUser.user.id;
    }

    const profileName =
      createProfileName(email);

    const {
      error: profileError,
    } = await adminSupabase
      .from("profiles")
      .upsert(
        {
          id: invitedUserId,
          email,
          full_name: profileName,
        },
        {
          onConflict: "id",
        },
      );

    if (profileError) {
      console.error(
        "Profile save failed:",
        profileError,
      );

      return jsonError(
        profileError.message,
        500,
      );
    }

    const {
      error: membershipError,
    } = await adminSupabase
      .from("workspace_members")
      .upsert(
        {
          workspace_id: workspaceId,
          user_id: invitedUserId,
          role,
          created_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "workspace_id,user_id",
        },
      );

    if (membershipError) {
      console.error(
        "Workspace membership save failed:",
        membershipError,
      );

      return jsonError(
        membershipError.message,
        500,
      );
    }

    const passwordRedirectUrl =
      buildPasswordRedirectUrl();

    const {
      data: linkData,
      error: linkError,
    } =
      await adminSupabase.auth.admin.generateLink(
        {
          type: "recovery",
          email,
          options: {
            redirectTo:
              passwordRedirectUrl,
          },
        },
      );

    if (
      linkError ||
      !linkData.properties?.action_link
    ) {
      console.error(
        "Password setup link failed:",
        linkError,
      );

      return jsonError(
        linkError?.message ??
          "Could not generate password setup link.",
        500,
      );
    }

    let passwordSetupUrl: string;

    try {
      passwordSetupUrl =
        forceRedirectUrl(
          linkData.properties.action_link,
          passwordRedirectUrl,
        );
    } catch (error) {
      console.error(
        "Could not rewrite password setup link:",
        error,
      );

      return jsonError(
        "Generated password setup link is invalid.",
        500,
      );
    }

    /*
     * Temporary diagnostics.
     * Remove these after confirming the URL.
     */
    console.log(
      "Password redirect URL:",
      passwordRedirectUrl,
    );

    console.log(
      "Final password setup URL:",
      passwordSetupUrl,
    );

    const safeEmail =
      escapeHtml(email);

    const safeRole =
      escapeHtml(role);

    const safePasswordSetupUrl =
      escapeHtml(passwordSetupUrl);

    const transporter =
      createTransporter();

    await transporter.sendMail({
      from:
        process.env.SMTP_FROM ??
        "ZenStax <syedshuaib@zenstaxit.com>",
      to: email,
      subject:
        "Set up your ZenStax workspace account",
      text: [
        "You have been invited to the ZenStax workspace.",
        "",
        `Email: ${email}`,
        `Role: ${role}`,
        "",
        "Create your password using this secure link:",
        passwordSetupUrl,
        "",
        "The link will open ZenStax and allow you to choose your own password.",
        "",
        isExistingUser
          ? "This invitation is linked to your existing ZenStax account."
          : "If you were not expecting this invitation, you can ignore this email.",
      ].join("\n"),
      html: `
        <!doctype html>
        <html>
          <body
            style="
              margin: 0;
              padding: 0;
              background: #f4f7fa;
              font-family: Arial, sans-serif;
              color: #071b31;
            "
          >
            <div
              style="
                max-width: 600px;
                margin: 0 auto;
                padding: 32px 20px;
              "
            >
              <div
                style="
                  background: #ffffff;
                  border-radius: 16px;
                  padding: 36px;
                "
              >
                <h2
                  style="
                    margin: 0 0 16px;
                    color: #071b31;
                  "
                >
                  Welcome to ZenStax
                </h2>

                <p
                  style="
                    color: #475569;
                    line-height: 1.7;
                  "
                >
                  You have been invited to join the
                  ZenStax business workspace.
                </p>

                <p
                  style="
                    color: #475569;
                    line-height: 1.7;
                  "
                >
                  <strong>Email:</strong>
                  ${safeEmail}
                  <br />
                  <strong>Role:</strong>
                  ${safeRole}
                </p>

                <p
                  style="
                    color: #475569;
                    line-height: 1.7;
                  "
                >
                  Create your own secure password by
                  clicking the button below.
                </p>

                <p style="margin: 28px 0">
                  <a
                    href="${safePasswordSetupUrl}"
                    style="
                      display: inline-block;
                      padding: 14px 24px;
                      border-radius: 8px;
                      background: #ff7425;
                      color: #ffffff;
                      text-decoration: none;
                      font-weight: bold;
                    "
                  >
                    Create your password
                  </a>
                </p>

                <p
                  style="
                    color: #64748b;
                    font-size: 13px;
                    line-height: 1.6;
                  "
                >
                  This link is for your ZenStax account.
                  If you were not expecting this email,
                  you can ignore it.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json(
      {
        success: true,
        userId: invitedUserId,
        email,
        role,
        isExistingUser,
        message:
          `Invitation sent to ${email}.`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Custom member invitation failed:",
      error,
    );

    return jsonError(
      error instanceof Error
        ? error.message
        : "Could not invite member.",
      500,
    );
  }
}