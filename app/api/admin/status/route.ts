import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@supabase/supabase-js";


export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";


// ============================================================
// Environment
// ============================================================

function getRequiredEnv(
  name: string
): string {
  const value =
    process.env[name];

  if (!value) {
    throw new Error(
      `環境変数 ${name} が設定されていません。`
    );
  }

  return value;
}


// ============================================================
// GET
// 管理者か確認
// ============================================================

export async function GET(
  request: NextRequest
) {
  try {
    const supabaseUrl =
      getRequiredEnv(
        "NEXT_PUBLIC_SUPABASE_URL"
      );

    const publishableKey =
      getRequiredEnv(
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
      );

    const adminEmails =
      getRequiredEnv(
        "ADMIN_EMAILS"
      )
        .split(",")
        .map(
          (email) =>
            email
              .trim()
              .toLowerCase()
        )
        .filter(Boolean);


    // --------------------------------------------------------
    // Authorization
    // --------------------------------------------------------

    const authHeader =
      request.headers.get(
        "authorization"
      );


    if (
      !authHeader ||
      !authHeader.startsWith(
        "Bearer "
      )
    ) {
      return NextResponse.json(
        {
          success:
            true,

          isAdmin:
            false,
        }
      );
    }


    const accessToken =
      authHeader
        .slice(7)
        .trim();


    // --------------------------------------------------------
    // User確認
    // --------------------------------------------------------

    const supabase =
      createClient(
        supabaseUrl,
        publishableKey,
        {
          global: {
            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          },

          auth: {
            autoRefreshToken:
              false,

            persistSession:
              false,
          },
        }
      );


    const {
      data,
      error,
    } =
      await supabase
        .auth
        .getUser();


    if (
      error ||
      !data.user
    ) {
      return NextResponse.json(
        {
          success:
            true,

          isAdmin:
            false,
        }
      );
    }


    const email =
      data.user.email
        ?.trim()
        .toLowerCase();


    const isAdmin =
      !!email &&
      adminEmails.includes(
        email
      );


    return NextResponse.json({
      success:
        true,

      isAdmin,
    });

  } catch (
    error
  ) {
    console.error(
      "Admin status API error:",
      error
    );


    return NextResponse.json(
      {
        success:
          false,

        isAdmin:
          false,
      },
      {
        status:
          500,
      }
    );
  }
}