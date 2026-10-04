import {
  createServerClient,
} from "@supabase/ssr";

import {
  NextResponse,
  type NextRequest,
} from "next/server";

export async function proxy(
  request: NextRequest,
) {
  let response =
    NextResponse.next({
      request,
    });

  const pathname =
    request.nextUrl.pathname;

  const publicRoutes = [
    "/login",
    "/set-password",
    "/forgot-password",
  ];

  const isPublicRoute =
    publicRoutes.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(`${route}/`),
    ) ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth");

  const supabase =
    createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },

          setAll(cookiesToSet) {
            cookiesToSet.forEach(
              ({
                name,
                value,
              }) => {
                request.cookies.set(
                  name,
                  value,
                );
              },
            );

            response =
              NextResponse.next({
                request,
              });

            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                response.cookies.set(
                  name,
                  value,
                  options,
                );
              },
            );
          },
        },
      },
    );

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(
      new URL("/login", request.url),
    );
  }

  /*
   * Do not redirect /set-password.
   * The recovery link needs to load this page
   * so the browser client can process the hash token.
   */
  if (
    user &&
    pathname === "/login"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url),
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};