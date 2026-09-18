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
// POST
// ============================================================

export async function POST(
  request:
    NextRequest
) {
  let reservedInviteId:
    string | null =
    null;


  try {

    // --------------------------------------------------------
    // リクエスト取得
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


    // --------------------------------------------------------
    // Admin Client
    // 招待コード確認専用
    // --------------------------------------------------------

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
      throw new Error(
        `招待コードを確認できませんでした: ${inviteError.message}`
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
            "招待コードが正しくありません。",
        },
        {
          status:
            403,
        }
      );
    }


    // --------------------------------------------------------
    // 招待コード有効確認
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
            "この招待コードはすでに使用されています。",
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
      const expiresAt =
        new Date(
          invite.expires_at
        );


      if (
        expiresAt.getTime() <=
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
    // 招待枠を確保
    //
    // use_count が現在値のままの場合だけ更新することで、
    // 同じコードの同時使用をできるだけ防止する
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
      throw new Error(
        `招待コードを確保できませんでした: ${reserveError.message}`
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


    reservedInviteId =
      invite.id;


    // --------------------------------------------------------
    // 通常のSupabase Auth Client
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
    // アカウント作成
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
      // 登録失敗なら招待枠を戻す
      // ----------------------------------------------

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


      reservedInviteId =
        null;


      return NextResponse.json(
        {
          success:
            false,

          error:
            signUpError
              ? signUpError.message
              : "アカウントを作成できませんでした。",
        },
        {
          status:
            400,
        }
      );
    }


    // --------------------------------------------------------
    // 招待コード使用履歴
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
      // 使用履歴保存失敗時は
      // 作ったユーザーを削除して招待枠も戻す
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


      reservedInviteId =
        null;


      return NextResponse.json(
        {
          success:
            false,

          error:
            "招待コードの使用記録を保存できませんでした。もう一度お試しください。",
        },
        {
          status:
            500,
        }
      );
    }


    reservedInviteId =
      null;


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
          "新規登録中にエラーが発生しました。",
      },
      {
        status:
          500,
      }
    );
  }
}