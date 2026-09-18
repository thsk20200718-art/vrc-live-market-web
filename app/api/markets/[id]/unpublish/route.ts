import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


// ============================================================
// 型
// ============================================================

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type GitHubFileInfo = {
  sha?: string;
};

type GitHubDirectoryItem = {
  type: string;
  name: string;
  path: string;
  sha: string;
};

type CatalogMarket = {
  marketId: string;
  slot: number;
  title: string;
  authorizedDisplayNames: string[];
};


// ============================================================
// 環境変数
// ============================================================

function getRequiredEnv(
  name: string
) {
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
// Display Name整理
// ============================================================

function cleanDisplayNames(
  names:
    | string[]
    | null
    | undefined
) {
  const result: string[] = [];

  for (
    const rawName of names ?? []
  ) {
    const name =
      rawName.trim();

    if (!name) {
      continue;
    }

    const exists =
      result.some(
        (existing) =>
          existing.toLowerCase() ===
          name.toLowerCase()
      );

    if (!exists) {
      result.push(name);
    }
  }

  return result;
}


function buildAuthorizedDisplayNames(
  sellerNames: string[],
  staffNames: string[]
) {
  return cleanDisplayNames([
    ...sellerNames,
    ...staffNames,
  ]);
}


// ============================================================
// GitHub設定
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


// ============================================================
// GitHub API
// ============================================================

async function githubFetch(
  apiPath: string,
  options: RequestInit = {}
) {
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

      cache: "no-store",
    }
  );
}


// ============================================================
// Path Encode
// ============================================================

function encodeGitHubPath(
  filePath: string
) {
  return filePath
    .split("/")
    .map(
      encodeURIComponent
    )
    .join("/");
}


// ============================================================
// GitHubファイル確認
// ============================================================

async function getGitHubFileInfo(
  filePath: string
): Promise<GitHubFileInfo | null> {
  const config =
    getGitHubConfig();

  const encodedPath =
    encodeGitHubPath(
      filePath
    );

  const response =
    await githubFetch(
      `/contents/${encodedPath}?ref=${encodeURIComponent(
        config.branch
      )}`
    );

  if (
    response.status === 404
  ) {
    return null;
  }

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `GitHubファイル確認に失敗しました (${filePath}): ${response.status} ${errorText}`
    );
  }

  return (
    await response.json()
  ) as GitHubFileInfo;
}


// ============================================================
// GitHubディレクトリ取得
// ============================================================

async function getGitHubDirectoryFiles(
  directoryPath: string
): Promise<GitHubDirectoryItem[]> {
  const config =
    getGitHubConfig();

  const encodedPath =
    encodeGitHubPath(
      directoryPath
    );

  const response =
    await githubFetch(
      `/contents/${encodedPath}?ref=${encodeURIComponent(
        config.branch
      )}`
    );

  if (
    response.status === 404
  ) {
    return [];
  }

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `GitHubディレクトリ取得に失敗しました (${directoryPath}): ${response.status} ${errorText}`
    );
  }

  const result =
    await response.json();

  if (!Array.isArray(result)) {
    return [];
  }

  return result as GitHubDirectoryItem[];
}


// ============================================================
// GitHubファイル削除
// ============================================================

async function deleteGitHubFile(
  filePath: string,
  commitMessage: string
) {
  const config =
    getGitHubConfig();

  const currentFile =
    await getGitHubFileInfo(
      filePath
    );

  if (
    !currentFile?.sha
  ) {
    return false;
  }

  const encodedPath =
    encodeGitHubPath(
      filePath
    );

  const response =
    await githubFetch(
      `/contents/${encodedPath}`,
      {
        method:
          "DELETE",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            message:
              commitMessage,

            sha:
              currentFile.sha,

            branch:
              config.branch,
          }),
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `GitHubファイル削除に失敗しました (${filePath}): ${response.status} ${errorText}`
    );
  }

  return true;
}


// ============================================================
// GitHubファイル書き込み
// ============================================================

async function putGitHubFile(
  filePath: string,
  content: Buffer | string,
  commitMessage: string
) {
  const config =
    getGitHubConfig();

  const currentFile =
    await getGitHubFileInfo(
      filePath
    );

  const encodedPath =
    encodeGitHubPath(
      filePath
    );

  const buffer =
    typeof content === "string"
      ? Buffer.from(
          content,
          "utf8"
        )
      : content;

  const body: {
    message: string;
    content: string;
    branch: string;
    sha?: string;
  } = {
    message:
      commitMessage,

    content:
      buffer.toString(
        "base64"
      ),

    branch:
      config.branch,
  };

  if (
    currentFile?.sha
  ) {
    body.sha =
      currentFile.sha;
  }

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
          JSON.stringify(
            body
          ),
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `GitHubへの書き込みに失敗しました (${filePath}): ${response.status} ${errorText}`
    );
  }
}


// ============================================================
// catalog.json再生成
// ============================================================

async function rebuildCatalog(
  supabaseUrl: string,
  supabaseSecretKey: string,
  unpublishedMarketUuid: string
) {
  const supabaseAdmin =
    createClient(
      supabaseUrl,
      supabaseSecretKey,
      {
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
      publishedMarkets,

    error:
      publishedMarketsError,
  } =
    await supabaseAdmin
      .from("markets")
      .select(
        "id, market_id, title, seller_display_names, staff_display_names, runtime_slot, status"
      )
      .eq(
        "status",
        "published"
      )
      .not(
        "runtime_slot",
        "is",
        null
      );


  if (
    publishedMarketsError
  ) {
    throw new Error(
      `catalog用販売会一覧を取得できませんでした: ${publishedMarketsError.message}`
    );
  }


  const catalogMarkets:
    CatalogMarket[] = [];


  for (
    const item of
    publishedMarkets ?? []
  ) {
    if (
      item.id ===
      unpublishedMarketUuid
    ) {
      continue;
    }


    if (
      item.runtime_slot ===
      null
    ) {
      continue;
    }


    const sellerNames =
      cleanDisplayNames(
        item.seller_display_names
      );


    const staffNames =
      cleanDisplayNames(
        item.staff_display_names
      );


    const authorizedDisplayNames =
      buildAuthorizedDisplayNames(
        sellerNames,
        staffNames
      );


    catalogMarkets.push({
      marketId:
        item.market_id,

      slot:
        item.runtime_slot,

      title:
        item.title,

      authorizedDisplayNames,
    });
  }


  catalogMarkets.sort(
    (a, b) =>
      a.slot - b.slot
  );


  const catalogJson =
    JSON.stringify(
      {
        markets:
          catalogMarkets,
      },
      null,
      2
    ) + "\n";


  await putGitHubFile(
    "runtime/catalog.json",

    catalogJson,

    "Update catalog after unpublish"
  );
}


// ============================================================
// Runtime公開データ削除
// ============================================================

async function deletePublishedRuntime(
  runtimeSlot: number,
  marketId: string
) {
  const slotFolder =
    String(
      runtimeSlot
    ).padStart(
      2,
      "0"
    );


  const imageDirectory =
    `runtime/slots/${slotFolder}/images`;


  const imageFiles =
    await getGitHubDirectoryFiles(
      imageDirectory
    );


  let deletedImageCount =
    0;


  for (
    const item of imageFiles
  ) {
    if (
      item.type !== "file"
    ) {
      continue;
    }


    const deleted =
      await deleteGitHubFile(
        item.path,

        `Unpublish ${marketId} runtime image ${item.name}`
      );


    if (deleted) {
      deletedImageCount++;
    }
  }


  const marketJsonPath =
    `runtime/slots/${slotFolder}/market.json`;


  const deletedMarketJson =
    await deleteGitHubFile(
      marketJsonPath,

      `Unpublish ${marketId} market data`
    );


  return {
    deletedImageCount,
    deletedMarketJson,
  };
}


// ============================================================
// POST
// ============================================================

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabaseUrl =
      getRequiredEnv(
        "NEXT_PUBLIC_SUPABASE_URL"
      );


    const supabaseSecretKey =
      getRequiredEnv(
        "SUPABASE_SECRET_KEY"
      );


    const {
      id: marketUuid,
    } =
      await context.params;


    if (!marketUuid) {
      return NextResponse.json(
        {
          success: false,

          error:
            "販売会IDがありません。",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================================
    // Authorization
    // ========================================================

    const authorization =
      request.headers.get(
        "authorization"
      );


    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "ログイン情報がありません。",
        },
        {
          status: 401,
        }
      );
    }


    const accessToken =
      authorization.replace(
        "Bearer ",
        ""
      );


    const supabaseAdmin =
      createClient(
        supabaseUrl,
        supabaseSecretKey,
        {
          auth: {
            autoRefreshToken:
              false,

            persistSession:
              false,
          },
        }
      );


    // ========================================================
    // User
    // ========================================================

    const {
      data:
        userData,

      error:
        userError,
    } =
      await supabaseAdmin
        .auth
        .getUser(
          accessToken
        );


    if (
      userError ||
      !userData.user
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "ログイン情報を確認できませんでした。",
        },
        {
          status: 401,
        }
      );
    }


    const user =
      userData.user;


    // ========================================================
    // Market
    // ========================================================

    const {
      data:
        market,

      error:
        marketError,
    } =
      await supabaseAdmin
        .from("markets")
        .select(
          "id, user_id, market_id, title, status, runtime_slot"
        )
        .eq(
          "id",
          marketUuid
        )
        .single();


    if (
      marketError ||
      !market
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "販売会が見つかりません。",
        },
        {
          status: 404,
        }
      );
    }


    // ========================================================
    // 所有者確認
    // ========================================================

    if (
      market.user_id !==
      user.id
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "この販売会を公開解除する権限がありません。",
        },
        {
          status: 403,
        }
      );
    }


    // ========================================================
    // すでに下書きなら終了
    // ========================================================

    if (
      market.status !==
      "published"
    ) {
      return NextResponse.json({
        success: true,

        message:
          "この販売会はすでに公開解除されています。",

        marketId:
          market.market_id,

        runtimeSlot:
          market.runtime_slot,
      });
    }


    // ========================================================
    // GitHub Runtime削除
    // ========================================================

    let deletedRuntimeImageCount =
      0;


    let deletedMarketJson =
      false;


    if (
      market.runtime_slot !==
      null
    ) {
      const result =
        await deletePublishedRuntime(
          market.runtime_slot,
          market.market_id
        );


      deletedRuntimeImageCount =
        result.deletedImageCount;


      deletedMarketJson =
        result.deletedMarketJson;
    }


    // ========================================================
    // catalog.json更新
    // ========================================================

    await rebuildCatalog(
      supabaseUrl,
      supabaseSecretKey,
      marketUuid
    );


    // ========================================================
    // Supabase状態変更
    //
    // runtime_slotは変更しない
    // ========================================================

    const {
      error:
        updateError,
    } =
      await supabaseAdmin
        .from("markets")
        .update({
          status:
            "draft",

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          marketUuid
        )
        .eq(
          "user_id",
          user.id
        );


    if (
      updateError
    ) {
      throw new Error(
        `公開状態の更新に失敗しました: ${updateError.message}`
      );
    }


    // ========================================================
    // 完了
    // ========================================================

    return NextResponse.json({
      success: true,

      message:
        "販売会の公開を解除しました。",

      marketId:
        market.market_id,

      runtimeSlot:
        market.runtime_slot,

      deletedRuntimeImageCount,

      deletedMarketJson,

      catalogUpdated:
        true,
    });

  } catch (error) {
    console.error(
      "Unpublish market error:",
      error
    );


    const message =
      error instanceof Error
        ? error.message
        : "公開解除中に不明なエラーが発生しました。";


    return NextResponse.json(
      {
        success: false,

        error:
          message,
      },
      {
        status: 500,
      }
    );
  }
}