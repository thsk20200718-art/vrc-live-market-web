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
// 管理者Client
// ============================================================

async function getAdminClient(
  request: NextRequest
) {
  const supabaseUrl =
    getRequiredEnv(
      "NEXT_PUBLIC_SUPABASE_URL"
    );

  const publishableKey =
    getRequiredEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );

  const secretKey =
    getRequiredEnv(
      "SUPABASE_SECRET_KEY"
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
      );


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
    return null;
  }


  const token =
    authHeader
      .slice(7)
      .trim();


  const userClient =
    createClient(
      supabaseUrl,
      publishableKey,
      {
        global: {
          headers: {
            Authorization:
              `Bearer ${token}`,
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
  } =
    await userClient
      .auth
      .getUser();


  const email =
    data.user
      ?.email
      ?.toLowerCase();


  if (
    !email ||
    !adminEmails.includes(
      email
    )
  ) {
    return null;
  }


  return createClient(
    supabaseUrl,
    secretKey,
    {
      auth: {
        autoRefreshToken:
          false,

        persistSession:
          false,
      },
    }
  );
}


// ============================================================
// PATCH
// 有効・無効切り替え
// ============================================================

export async function PATCH(
  request: NextRequest,

  context: {
    params:
      Promise<{
        id: string;
      }>;
  }
) {
  try {
    const adminClient =
      await getAdminClient(
        request
      );


    if (!adminClient) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "管理者権限がありません。",
        },
        {
          status:
            403,
        }
      );
    }


    const {
      id,
    } =
      await context.params;


    const body =
      await request.json();


    if (
      typeof body.isActive !==
      "boolean"
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "状態が正しくありません。",
        },
        {
          status:
            400,
        }
      );
    }


    const {
      data,
      error,
    } =
      await adminClient
        .from(
          "invite_codes"
        )
        .update({
          is_active:
            body.isActive,

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          id
        )
        .select(
          "id, code, label, is_active, max_uses, use_count, expires_at, created_at"
        )
        .single();


    if (error) {
      throw new Error(
        error.message
      );
    }


    return NextResponse.json({
      success:
        true,

      invite:
        data,
    });

  } catch (error) {
    console.error(
      "Invite toggle error:",
      error
    );


    return NextResponse.json(
      {
        success:
          false,

        error:
          "招待コードの更新に失敗しました。",
      },
      {
        status:
          500,
      }
    );
  }
}