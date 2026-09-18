import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@supabase/supabase-js";

import {
  randomBytes,
} from "crypto";


export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";


// ============================================================
// 定数
// ============================================================

const MAX_EXPIRATION_DATE =
  new Date(
    "2035-12-31T23:59:59.999Z"
  );


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
// 管理者認証
// ============================================================

async function getAdminContext(
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
    return {
      error:
        "ログイン情報がありません。",

      status:
        401,
    } as const;
  }


  const accessToken =
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
    data: userData,
    error: userError,
  } =
    await userClient
      .auth
      .getUser();


  if (
    userError ||
    !userData.user
  ) {
    return {
      error:
        "ログイン情報を確認できませんでした。",

      status:
        401,
    } as const;
  }


  const email =
    userData.user.email
      ?.trim()
      .toLowerCase();


  if (
    !email ||
    !adminEmails.includes(
      email
    )
  ) {
    return {
      error:
        "管理者権限がありません。",

      status:
        403,
    } as const;
  }


  const adminClient =
    createClient(
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


  return {
    user:
      userData.user,

    adminClient,
  } as const;
}


// ============================================================
// 招待コード生成
// ============================================================

function createInviteCode() {
  const random =
    randomBytes(5)
      .toString("hex")
      .toUpperCase();

  return `VRC-BETA-${random}`;
}


// ============================================================
// GET
// ============================================================

export async function GET(
  request: NextRequest
) {
  try {
    const context =
      await getAdminContext(
        request
      );


    if (
      "error" in context
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            context.error,
        },
        {
          status:
            context.status,
        }
      );
    }


    const {
      adminClient,
    } =
      context;


    const {
      data: invites,
      error: invitesError,
    } =
      await adminClient
        .from(
          "invite_codes"
        )
        .select(
          "id, code, label, is_active, max_uses, use_count, expires_at, created_at, updated_at"
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        );


    if (
      invitesError
    ) {
      throw new Error(
        invitesError.message
      );
    }


    const {
      data: uses,
      error: usesError,
    } =
      await adminClient
        .from(
          "invite_code_uses"
        )
        .select(
          "id, invite_code_id, user_id, used_at"
        )
        .order(
          "used_at",
          {
            ascending:
              false,
          }
        );


    if (
      usesError
    ) {
      throw new Error(
        usesError.message
      );
    }


    const usageList = [];


    for (
      const usage of
      uses ?? []
    ) {
      let userEmail:
        string | null =
        null;


      const {
        data:
          userResult,
      } =
        await adminClient
          .auth
          .admin
          .getUserById(
            usage.user_id
          );


      if (
        userResult.user
          ?.email
      ) {
        userEmail =
          userResult
            .user
            .email;
      }


      usageList.push({
        ...usage,

        email:
          userEmail,
      });
    }


    return NextResponse.json({
      success:
        true,

      invites:
        invites ?? [],

      uses:
        usageList,
    });

  } catch (
    error
  ) {
    console.error(
      "Admin invites GET error:",
      error
    );


    return NextResponse.json(
      {
        success:
          false,

        error:
          "招待コードの取得に失敗しました。",
      },
      {
        status:
          500,
      }
    );
  }
}


// ============================================================
// POST
// 招待コード発行
// ============================================================

export async function POST(
  request: NextRequest
) {
  try {
    const context =
      await getAdminContext(
        request
      );


    if (
      "error" in context
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            context.error,
        },
        {
          status:
            context.status,
        }
      );
    }


    const {
      adminClient,
    } =
      context;


    let body: {
      label?: unknown;
      maxUses?: unknown;
      expiresAt?: unknown;
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
            "入力内容が正しくありません。",
        },
        {
          status:
            400,
        }
      );
    }


    // --------------------------------------------------------
    // Label
    // --------------------------------------------------------

    const label =
      typeof body.label ===
      "string"
        ? body.label.trim()
        : "";


    if (
      label.length >
      100
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "ラベルは100文字以内で入力してください。",
        },
        {
          status:
            400,
        }
      );
    }


    // --------------------------------------------------------
    // Max Uses
    // --------------------------------------------------------

    const maxUses =
      typeof body.maxUses ===
      "number"
        ? Math.floor(
            body.maxUses
          )
        : NaN;


    if (
      !Number.isFinite(
        maxUses
      ) ||
      maxUses < 1 ||
      maxUses > 100
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "利用上限は1〜100回で設定してください。",
        },
        {
          status:
            400,
        }
      );
    }


    // --------------------------------------------------------
    // Expires At
    // --------------------------------------------------------

    let expiresAt:
      string | null =
      null;


    if (
      body.expiresAt !==
        null &&
      body.expiresAt !==
        undefined &&
      body.expiresAt !==
        ""
    ) {
      if (
        typeof body.expiresAt !==
        "string"
      ) {
        return NextResponse.json(
          {
            success:
              false,

            error:
              "有効期限が正しくありません。",
          },
          {
            status:
              400,
          }
        );
      }


      const expirationDate =
        new Date(
          body.expiresAt
        );


      if (
        Number.isNaN(
          expirationDate.getTime()
        )
      ) {
        return NextResponse.json(
          {
            success:
              false,

            error:
              "有効期限が正しくありません。",
          },
          {
            status:
              400,
          }
        );
      }


      if (
        expirationDate.getTime() <=
        Date.now()
      ) {
        return NextResponse.json(
          {
            success:
              false,

            error:
              "有効期限は現在より後の日時を指定してください。",
          },
          {
            status:
              400,
          }
        );
      }


      if (
        expirationDate.getTime() >
        MAX_EXPIRATION_DATE.getTime()
      ) {
        return NextResponse.json(
          {
            success:
              false,

            error:
              "有効期限は2035年12月31日までで設定してください。",
          },
          {
            status:
              400,
          }
        );
      }


      expiresAt =
        expirationDate
          .toISOString();
    }


    // --------------------------------------------------------
    // 招待コード生成
    // --------------------------------------------------------

    let createdInvite =
      null;


    for (
      let attempt = 0;
      attempt < 5;
      attempt++
    ) {
      const code =
        createInviteCode();


      const {
        data,
        error,
      } =
        await adminClient
          .from(
            "invite_codes"
          )
          .insert({
            code,

            label:
              label ||
              null,

            max_uses:
              maxUses,

            expires_at:
              expiresAt,
          })
          .select(
            "id, code, label, is_active, max_uses, use_count, expires_at, created_at, updated_at"
          )
          .single();


      if (
        !error
      ) {
        createdInvite =
          data;

        break;
      }


      if (
        error.code !==
        "23505"
      ) {
        throw new Error(
          error.message
        );
      }
    }


    if (
      !createdInvite
    ) {
      throw new Error(
        "招待コードを生成できませんでした。"
      );
    }


    return NextResponse.json({
      success:
        true,

      invite:
        createdInvite,
    });

  } catch (
    error
  ) {
    console.error(
      "Admin invites POST error:",
      error
    );


    return NextResponse.json(
      {
        success:
          false,

        error:
          "招待コードの発行中にエラーが発生しました。",
      },
      {
        status:
          500,
      }
    );
  }
}