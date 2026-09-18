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

  if (
    !value
  ) {
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
      )
      .filter(Boolean);


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
    error,
  } =
    await userClient
      .auth
      .getUser();


  if (
    error ||
    !data.user
  ) {
    return null;
  }


  const email =
    data.user.email
      ?.trim()
      .toLowerCase();


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


    if (
      !adminClient
    ) {
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


    let body: {
      isActive?: unknown;
    };


    try {
      body =
        await request.json();

    } catch {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "入力内容を確認できませんでした。",
        },
        {
          status:
            400,
        }
      );
    }


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
          "id, code, label, is_active, max_uses, use_count, expires_at, created_at, updated_at"
        )
        .maybeSingle();


    if (
      error
    ) {
      throw new Error(
        error.message
      );
    }


    if (
      !data
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "招待コードが見つかりません。",
        },
        {
          status:
            404,
        }
      );
    }


    return NextResponse.json({
      success:
        true,

      invite:
        data,
    });

  } catch (
    error
  ) {
    console.error(
      "Invite update error:",
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


// ============================================================
// DELETE
// 未使用の招待コードのみ削除
// ============================================================

export async function DELETE(
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


    if (
      !adminClient
    ) {
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


    // --------------------------------------------------------
    // 招待コード確認
    // --------------------------------------------------------

    const {
      data:
        invite,

      error:
        inviteError,
    } =
      await adminClient
        .from(
          "invite_codes"
        )
        .select(
          "id, code, use_count"
        )
        .eq(
          "id",
          id
        )
        .maybeSingle();


    if (
      inviteError
    ) {
      throw new Error(
        inviteError.message
      );
    }


    if (
      !invite
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "招待コードが見つかりません。",
        },
        {
          status:
            404,
        }
      );
    }


    // --------------------------------------------------------
    // 使用履歴確認
    // --------------------------------------------------------

    const {
      count:
        usageCount,

      error:
        usageCountError,
    } =
      await adminClient
        .from(
          "invite_code_uses"
        )
        .select(
          "*",
          {
            count:
              "exact",

            head:
              true,
          }
        )
        .eq(
          "invite_code_id",
          id
        );


    if (
      usageCountError
    ) {
      throw new Error(
        usageCountError.message
      );
    }


    // --------------------------------------------------------
    // 使用済みは削除禁止
    // --------------------------------------------------------

    if (
      invite.use_count >
        0 ||
      (
        usageCount ??
        0
      ) >
        0
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "使用履歴がある招待コードは削除できません。必要な場合は無効化してください。",
        },
        {
          status:
            409,
        }
      );
    }


    // --------------------------------------------------------
    // 削除
    // --------------------------------------------------------

    const {
      error:
        deleteError,
    } =
      await adminClient
        .from(
          "invite_codes"
        )
        .delete()
        .eq(
          "id",
          id
        );


    if (
      deleteError
    ) {
      throw new Error(
        deleteError.message
      );
    }


    return NextResponse.json({
      success:
        true,

      deletedId:
        id,
    });

  } catch (
    error
  ) {
    console.error(
      "Invite delete error:",
      error
    );


    return NextResponse.json(
      {
        success:
          false,

        error:
          "招待コードの削除に失敗しました。",
      },
      {
        status:
          500,
      }
    );
  }
}