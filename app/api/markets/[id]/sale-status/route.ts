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
// 型
// ============================================================

type SaleStatus =
  | "READY"
  | "LIVE"
  | "ENDED";


type MarketData = {
  id: string;
  user_id: string;
  market_id: string;
  status: string;
  sale_status: SaleStatus;
  runtime_slot: number | null;
};


type GitHubFileResponse = {
  sha: string;
  content?: string;
  encoding?: string;
};


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
// GitHub
// ============================================================

function getGitHubConfig() {
  return {
    token:
      getRequiredEnv(
        "GITHUB_TOKEN"
      ),

    owner:
      getRequiredEnv(
        "GITHUB_OWNER"
      ),

    repo:
      getRequiredEnv(
        "GITHUB_REPO"
      ),

    branch:
      process.env
        .GITHUB_BRANCH ||
      "main",
  };
}


async function githubFetch(
  apiPath: string,

  options:
    RequestInit = {}
): Promise<Response> {
  const config =
    getGitHubConfig();


  return fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}${apiPath}`,
    {
      ...options,

      headers: {
        Accept:
          "application/vnd.github+json",

        Authorization:
          `Bearer ${config.token}`,

        "X-GitHub-Api-Version":
          "2022-11-28",

        ...options.headers,
      },

      cache:
        "no-store",
    }
  );
}


// ============================================================
// GitHubからmarket.json取得
// ============================================================

async function getGitHubMarketJson(
  filePath: string
): Promise<{
  sha: string;
  json: Record<
    string,
    unknown
  >;
}> {
  const config =
    getGitHubConfig();


  const encodedPath =
    filePath
      .split("/")
      .map(
        encodeURIComponent
      )
      .join("/");


  const response =
    await githubFetch(
      `/contents/${encodedPath}?ref=${encodeURIComponent(
        config.branch
      )}`
    );


  if (
    !response.ok
  ) {
    const errorText =
      await response.text();


    throw new Error(
      `market.jsonを取得できませんでした: ${response.status} ${errorText}`
    );
  }


  const result =
    (
      await response.json()
    ) as GitHubFileResponse;


  if (
    !result.sha ||
    !result.content
  ) {
    throw new Error(
      "market.jsonの内容を取得できませんでした。"
    );
  }


  const decodedText =
    Buffer.from(
      result.content.replace(
        /\n/g,
        ""
      ),
      "base64"
    ).toString(
      "utf8"
    );


  let parsed:
    Record<
      string,
      unknown
    >;


  try {
    parsed =
      JSON.parse(
        decodedText
      ) as Record<
        string,
        unknown
      >;
  } catch {
    throw new Error(
      "GitHub上のmarket.jsonを解析できませんでした。"
    );
  }


  return {
    sha:
      result.sha,

    json:
      parsed,
  };
}


// ============================================================
// GitHubのmarket.json更新
// ============================================================

async function updateGitHubMarketJson(
  filePath: string,
  sha: string,
  json:
    Record<
      string,
      unknown
    >,
  marketId: string,
  saleStatus:
    SaleStatus
): Promise<void> {
  const config =
    getGitHubConfig();


  const encodedPath =
    filePath
      .split("/")
      .map(
        encodeURIComponent
      )
      .join("/");


  const text =
    JSON.stringify(
      json,
      null,
      2
    ) +
    "\n";


  const content =
    Buffer.from(
      text,
      "utf8"
    ).toString(
      "base64"
    );


  const response =
    await githubFetch(
      `/contents/${encodedPath}`,
      {
        method:
          "PUT",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            message:
              `Update sale status ${marketId} to ${saleStatus}`,

            content,

            sha,

            branch:
              config.branch,
          }),
      }
    );


  if (
    !response.ok
  ) {
    const errorText =
      await response.text();


    throw new Error(
      `market.jsonの更新に失敗しました: ${response.status} ${errorText}`
    );
  }
}


// ============================================================
// SaleStatus validation
// ============================================================

function isSaleStatus(
  value: unknown
): value is SaleStatus {
  return (
    value ===
      "READY" ||
    value ===
      "LIVE" ||
    value ===
      "ENDED"
  );
}


// ============================================================
// POST
// ============================================================

export async function POST(
  request:
    NextRequest,

  context: {
    params:
      Promise<{
        id: string;
      }>;
  }
) {
  try {
    // --------------------------------------------------------
    // Market UUID
    // --------------------------------------------------------

    const {
      id:
        marketUuid,
    } =
      await context.params;


    // --------------------------------------------------------
    // Request Body
    // --------------------------------------------------------

    let body:
      {
        saleStatus?: unknown;
      };


    try {
      body =
        await request.json();
    } catch {
      return (
        NextResponse.json(
          {
            success:
              false,

            error:
              "リクエストの形式が正しくありません。",
          },
          {
            status:
              400,
          }
        )
      );
    }


    if (
      !isSaleStatus(
        body.saleStatus
      )
    ) {
      return (
        NextResponse.json(
          {
            success:
              false,

            error:
              "販売状態が正しくありません。",
          },
          {
            status:
              400,
          }
        )
      );
    }


    const nextSaleStatus =
      body.saleStatus;


    // --------------------------------------------------------
    // Environment
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
      return (
        NextResponse.json(
          {
            success:
              false,

            error:
              "ログイン情報が送信されていません。",
          },
          {
            status:
              401,
          }
        )
      );
    }


    const accessToken =
      authHeader
        .slice(7)
        .trim();


    if (
      !accessToken
    ) {
      return (
        NextResponse.json(
          {
            success:
              false,

            error:
              "アクセストークンがありません。",
          },
          {
            status:
              401,
          }
        )
      );
    }


    // --------------------------------------------------------
    // User Client
    // --------------------------------------------------------

    const supabaseUser =
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
      data:
        userData,

      error:
        userError,
    } =
      await supabaseUser
        .auth
        .getUser();


    if (
      userError ||
      !userData.user
    ) {
      return (
        NextResponse.json(
          {
            success:
              false,

            error:
              "ログイン情報を確認できませんでした。",
          },
          {
            status:
              401,
          }
        )
      );
    }


    const user =
      userData.user;


    // --------------------------------------------------------
    // Admin Client
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
    // Market取得
    // --------------------------------------------------------

    const {
      data:
        marketData,

      error:
        marketError,
    } =
      await supabaseAdmin
        .from(
          "markets"
        )
        .select(
          "id, user_id, market_id, status, sale_status, runtime_slot"
        )
        .eq(
          "id",
          marketUuid
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle();


    if (
      marketError
    ) {
      throw new Error(
        `販売会を取得できませんでした: ${marketError.message}`
      );
    }


    if (
      !marketData
    ) {
      return (
        NextResponse.json(
          {
            success:
              false,

            error:
              "販売会が見つからないか、操作する権限がありません。",
          },
          {
            status:
              404,
          }
        )
      );
    }


    const market =
      marketData as
        MarketData;


    // --------------------------------------------------------
    // LIVEにする場合は公開済み必須
    // --------------------------------------------------------

    if (
      nextSaleStatus ===
        "LIVE" &&
      (
        market.status !==
          "published" ||
        market.runtime_slot ===
          null
      )
    ) {
      return (
        NextResponse.json(
          {
            success:
              false,

            error:
              "販売を開始するには、先に販売会を公開してください。",
          },
          {
            status:
              409,
          }
        )
      );
    }


    const previousSaleStatus:
      SaleStatus =
      market.sale_status ??
      "READY";


    // --------------------------------------------------------
    // GitHub更新に必要なJSONを先に取得
    // --------------------------------------------------------

    let runtimePath:
      string | null =
      null;


    let githubMarket:
      {
        sha: string;
        json:
          Record<
            string,
            unknown
          >;
      } | null =
      null;


    if (
      market.status ===
        "published" &&
      market.runtime_slot !==
        null
    ) {
      const slotFolder =
        String(
          market.runtime_slot
        ).padStart(
          2,
          "0"
        );


      runtimePath =
        `runtime/slots/${slotFolder}/market.json`;


      githubMarket =
        await getGitHubMarketJson(
          runtimePath
        );
    }


    // --------------------------------------------------------
    // Supabase更新
    // --------------------------------------------------------

    const {
      error:
        updateError,
    } =
      await supabaseAdmin
        .from(
          "markets"
        )
        .update({
          sale_status:
            nextSaleStatus,

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          market.id
        );


    if (
      updateError
    ) {
      throw new Error(
        `販売状態を保存できませんでした: ${updateError.message}`
      );
    }


    // --------------------------------------------------------
    // 公開済みならGitHubのmarket.jsonも更新
    // --------------------------------------------------------

    let runtimeUpdated =
      false;


    if (
      runtimePath &&
      githubMarket
    ) {
      try {
        githubMarket
          .json
          .saleStatus =
          nextSaleStatus;


        await updateGitHubMarketJson(
          runtimePath,
          githubMarket.sha,
          githubMarket.json,
          market.market_id,
          nextSaleStatus
        );


        runtimeUpdated =
          true;
      } catch (
        githubError
      ) {
        console.error(
          "GitHub sale status update error:",
          githubError
        );


        // ----------------------------------------------
        // GitHub更新に失敗したら
        // Supabaseも元の状態へ戻す
        // ----------------------------------------------

        const {
          error:
            rollbackError,
        } =
          await supabaseAdmin
            .from(
              "markets"
            )
            .update({
              sale_status:
                previousSaleStatus,

              updated_at:
                new Date()
                  .toISOString(),
            })
            .eq(
              "id",
              market.id
            );


        if (
          rollbackError
        ) {
          console.error(
            "Sale status rollback error:",
            rollbackError
          );
        }


        throw githubError;
      }
    }


    // --------------------------------------------------------
    // Success
    // --------------------------------------------------------

    return (
      NextResponse.json({
        success:
          true,

        marketId:
          market.market_id,

        previousSaleStatus,

        saleStatus:
          nextSaleStatus,

        runtimeUpdated,

        message:
          nextSaleStatus ===
          "LIVE"
            ? "販売を開始しました。"
            : nextSaleStatus ===
                "ENDED"
              ? "販売を終了しました。"
              : "販売状態を販売前に戻しました。",
      })
    );

  } catch (
    error
  ) {
    console.error(
      "Sale status API error:",
      error
    );


    const message =
      error instanceof
        Error
        ? error.message
        : "販売状態の変更中に不明なエラーが発生しました。";


    return (
      NextResponse.json(
        {
          success:
            false,

          error:
            message,
        },
        {
          status:
            500,
        }
      )
    );
  }
}