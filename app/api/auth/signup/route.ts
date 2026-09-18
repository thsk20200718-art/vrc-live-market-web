import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@supabase/supabase-js";

import {
  getAuthErrorMessage,
} from "@/lib/auth-errors";


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
// POST
// ============================================================

export async function POST(
  request:
    NextRequest
) {
  try {

    // --------------------------------------------------------
    // Request Body
    // --------------------------------------------------------

    let body: {
      email?: unknown;
      password?: unknown;
      inviteCode?: unknown;
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


    // --------------------------------------------------------
    // 入力値
    // --------------------------------------------------------

    const email =
      typeof body.email ===
      "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "";


    const password =
      typeof body.password ===
      "string"
        ? body.password
        : "";


    const inviteCode =
      typeof body.inviteCode ===
      "string"
        ? body.inviteCode
            .trim()
            .toUpperCase()
        : "";


    if (
      !email ||
      !password ||
      !inviteCode
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "メールアドレス、パスワード、招待コードを入力してください。",
        },
        {
          status:
            400,
        }
      );
    }


    if (
      password.length <
      6
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "パスワードは6文字以上で入力してください。",
        },
        {
          status:
            400,
        }
      );
    }


    // --------------------------------------------------------
    // Supabase
    // --------------------------------------------------------

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


    const supabaseAdmin =
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


    // --------------------------------------------------------
    // 招待コード取得
    // --------------------------------------------------------

    const {
      data:
        invite,

      error:
        inviteError,
    } =
      await supabaseAdmin
        .from(
          "invite_codes"
        )
        .select(
          "id, code, is_active, max_uses, use_count, expires_at"
        )
        .eq(
          "code",
          inviteCode
        )
        .maybeSingle();


    if (
      inviteError
    ) {
      console.error(
        "Invite code read error:",
        inviteError
      );


      return NextResponse.json(
        {
          success:
            false,

          error:
            "招待コードを確認できませんでした。時間をおいて、もう一度お試しください。",
        },
        {
          status:
            500,
        }
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
            "招待コードが正しくありません。入力内容をご確認ください。",
        },
        {
          status:
            403,
        }
      );
    }


    // --------------------------------------------------------
    // 招待コード状態確認
    // --------------------------------------------------------

    if (
      !invite.is_active
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "この招待コードは現在使用できません。",
        },
        {
          status:
            403,
        }
      );
    }


    if (
      invite.use_count >=
      invite.max_uses
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "この招待コードはすでに使用上限に達しています。",
        },
        {
          status:
            403,
        }
      );
    }


    if (
      invite.expires_at
    ) {
      const expirationDate =
        new Date(
          invite.expires_at
        );


      if (
        Number.isNaN(
          expirationDate.getTime()
        ) ||
        expirationDate.getTime() <=
        Date.now()
      ) {
        return NextResponse.json(
          {
            success:
              false,

            error:
              "この招待コードは有効期限が切れています。",
          },
          {
            status:
              403,
          }
        );
      }
    }


    // --------------------------------------------------------
    // 招待枠確保
    // --------------------------------------------------------

    const {
      data:
        reservedInvite,

      error:
        reserveError,
    } =
      await supabaseAdmin
        .from(
          "invite_codes"
        )
        .update({
          use_count:
            invite.use_count +
            1,

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          invite.id
        )
        .eq(
          "is_active",
          true
        )
        .eq(
          "use_count",
          invite.use_count
        )
        .lt(
          "use_count",
          invite.max_uses
        )
        .select(
          "id"
        )
        .maybeSingle();


    if (
      reserveError
    ) {
      console.error(
        "Invite reserve error:",
        reserveError
      );


      return NextResponse.json(
        {
          success:
            false,

          error:
            "招待コードの確認中にエラーが発生しました。もう一度お試しください。",
        },
        {
          status:
            500,
        }
      );
    }


    if (
      !reservedInvite
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "この招待コードはすでに使用された可能性があります。もう一度ご確認ください。",
        },
        {
          status:
            409,
        }
      );
    }


    // --------------------------------------------------------
    // Public Client
    // --------------------------------------------------------

    const supabasePublic =
      createClient(
        supabaseUrl,
        publishableKey,
        {
          auth: {
            autoRefreshToken:
              false,

            persistSession:
              false,
          },
        }
      );


    // --------------------------------------------------------
    // Signup
    // --------------------------------------------------------

    const siteUrl =
      request.nextUrl.origin;


    const {
      data:
        signUpData,

      error:
        signUpError,
    } =
      await supabasePublic
        .auth
        .signUp({
          email,
          password,

          options: {
            emailRedirectTo:
              `${siteUrl}/login`,
          },
        });


    if (
      signUpError ||
      !signUpData.user
    ) {

      // ----------------------------------------------
      // 招待枠を戻す
      // ----------------------------------------------

      const {
        error:
          rollbackInviteError,
      } =
        await supabaseAdmin
          .from(
            "invite_codes"
          )
          .update({
            use_count:
              invite.use_count,

            updated_at:
              new Date()
                .toISOString(),
          })
          .eq(
            "id",
            invite.id
          );


      if (
        rollbackInviteError
      ) {
        console.error(
          "Invite rollback error:",
          rollbackInviteError
        );
      }


      return NextResponse.json(
        {
          success:
            false,

          error:
            signUpError
              ? getAuthErrorMessage(
                  signUpError
                )
              : "アカウントを作成できませんでした。",
        },
        {
          status:
            400,
        }
      );
    }


    // --------------------------------------------------------
    // 使用履歴保存
    // --------------------------------------------------------

    const {
      error:
        usageError,
    } =
      await supabaseAdmin
        .from(
          "invite_code_uses"
        )
        .insert({
          invite_code_id:
            invite.id,

          user_id:
            signUpData.user.id,
        });


    if (
      usageError
    ) {
      console.error(
        "Invite usage save error:",
        usageError
      );


      // ----------------------------------------------
      // 作成ユーザー削除
      // ----------------------------------------------

      const {
        error:
          deleteUserError,
      } =
        await supabaseAdmin
          .auth
          .admin
          .deleteUser(
            signUpData.user.id
          );


      if (
        deleteUserError
      ) {
        console.error(
          "Rollback user delete error:",
          deleteUserError
        );
      }


      // ----------------------------------------------
      // 招待枠を戻す
      // ----------------------------------------------

      const {
        error:
          rollbackInviteError,
      } =
        await supabaseAdmin
          .from(
            "invite_codes"
          )
          .update({
            use_count:
              invite.use_count,

            updated_at:
              new Date()
                .toISOString(),
          })
          .eq(
            "id",
            invite.id
          );


      if (
        rollbackInviteError
      ) {
        console.error(
          "Invite rollback error:",
          rollbackInviteError
        );
      }


      return NextResponse.json(
        {
          success:
            false,

          error:
            "登録処理を完了できませんでした。時間をおいて、もう一度お試しください。",
        },
        {
          status:
            500,
        }
      );
    }


    // --------------------------------------------------------
    // Success
    // --------------------------------------------------------

    return NextResponse.json({
      success:
        true,

      requiresEmailConfirmation:
        !signUpData.session,

      message:
        signUpData.session
          ? "アカウントを作成しました。"
          : "アカウントを作成しました。確認メールをご確認ください。",
    });

  } catch (
    error
  ) {
    console.error(
      "Invite signup API error:",
      error
    );


    return NextResponse.json(
      {
        success:
          false,

        error:
          getAuthErrorMessage(
            error
          ),
      },
      {
        status:
          500,
      }
    );
  }
}