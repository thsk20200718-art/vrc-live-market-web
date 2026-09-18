import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRODUCT_IMAGE_BUCKET =
  "product-images-private";


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
// GitHub Path Encode
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

  if (
    !Array.isArray(result)
  ) {
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
//
// ★ Supabase Clientを引数で受け取らず、
//   この関数内で新しく作る。
// ============================================================

async function rebuildCatalog(
  supabaseUrl: string,
  supabaseSecretKey: string,
  deletedMarketUuid: string
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
      deletedMarketUuid
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

    "Update catalog after market deletion"
  );
}


// ============================================================
// 公開Runtimeデータ削除
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


  // ----------------------------------------------------------
  // JPEG削除
  // ----------------------------------------------------------

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

        `Delete ${marketId} runtime image ${item.name}`
      );


    if (deleted) {
      deletedImageCount++;
    }
  }


  // ----------------------------------------------------------
  // market.json削除
  // ----------------------------------------------------------

  const marketJsonPath =
    `runtime/slots/${slotFolder}/market.json`;


  const deletedMarketJson =
    await deleteGitHubFile(
      marketJsonPath,

      `Delete ${marketId} market data`
    );


  return {
    deletedImageCount,
    deletedMarketJson,
  };
}


// ============================================================
// DELETE
// ============================================================

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // ========================================================
    // 環境変数
    // ========================================================

    const supabaseUrl =
      getRequiredEnv(
        "NEXT_PUBLIC_SUPABASE_URL"
      );


    const supabaseSecretKey =
      getRequiredEnv(
        "SUPABASE_SECRET_KEY"
      );


    // ========================================================
    // Market UUID
    // ========================================================

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


    // ========================================================
    // Supabase Admin
    // ========================================================

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
    // ログインユーザー確認
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
      console.error(
        "Delete market auth error:",
        userError
      );


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
    // 販売会確認
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
          "id, user_id, title, market_id, status, runtime_slot"
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
      console.error(
        "Delete market load error:",
        marketError
      );


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
            "この販売会を削除する権限がありません。",
        },
        {
          status: 403,
        }
      );
    }


    // ========================================================
    // 商品取得
    // ========================================================

    const {
      data:
        products,

      error:
        productsError,
    } =
      await supabaseAdmin
        .from("products")
        .select("id")
        .eq(
          "market_id",
          marketUuid
        );


    if (
      productsError
    ) {
      throw new Error(
        `商品情報を取得できませんでした: ${productsError.message}`
      );
    }


    const productIds =
      (products ?? []).map(
        (product) =>
          product.id
      );


    // ========================================================
    // Storage Path取得
    // ========================================================

    let storagePaths:
      string[] = [];


    if (
      productIds.length > 0
    ) {
      const {
        data:
          imageRows,

        error:
          imageRowsError,
      } =
        await supabaseAdmin
          .from(
            "product_images"
          )
          .select(
            "storage_path"
          )
          .in(
            "product_id",
            productIds
          );


      if (
        imageRowsError
      ) {
        throw new Error(
          `商品画像情報を取得できませんでした: ${imageRowsError.message}`
        );
      }


      storagePaths =
        (
          imageRows ?? []
        )
          .map(
            (imageRow) =>
              imageRow.storage_path
          )
          .filter(
            (
              path
            ): path is string =>
              typeof path ===
                "string" &&
              path.length > 0
          );
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
      const runtimeDeleteResult =
        await deletePublishedRuntime(
          market.runtime_slot,
          market.market_id
        );


      deletedRuntimeImageCount =
        runtimeDeleteResult
          .deletedImageCount;


      deletedMarketJson =
        runtimeDeleteResult
          .deletedMarketJson;
    }


    // ========================================================
    // catalog.json更新
    //
    // ★ ここを変更
    // Supabase ClientではなくURLとSecretを渡す
    // ========================================================

    await rebuildCatalog(
      supabaseUrl,
      supabaseSecretKey,
      marketUuid
    );


    // ========================================================
    // product_images削除
    // ========================================================

    if (
      productIds.length > 0
    ) {
      const {
        error:
          imageDeleteError,
      } =
        await supabaseAdmin
          .from(
            "product_images"
          )
          .delete()
          .in(
            "product_id",
            productIds
          );


      if (
        imageDeleteError
      ) {
        throw new Error(
          `商品画像情報の削除に失敗しました: ${imageDeleteError.message}`
        );
      }
    }


    // ========================================================
    // products削除
    // ========================================================

    const {
      error:
        productsDeleteError,
    } =
      await supabaseAdmin
        .from("products")
        .delete()
        .eq(
          "market_id",
          marketUuid
        );


    if (
      productsDeleteError
    ) {
      throw new Error(
        `商品の削除に失敗しました: ${productsDeleteError.message}`
      );
    }


    // ========================================================
    // market削除
    // ========================================================

    const {
      error:
        marketDeleteError,
    } =
      await supabaseAdmin
        .from("markets")
        .delete()
        .eq(
          "id",
          marketUuid
        )
        .eq(
          "user_id",
          user.id
        );


    if (
      marketDeleteError
    ) {
      throw new Error(
        `販売会の削除に失敗しました: ${marketDeleteError.message}`
      );
    }


    // ========================================================
    // Private Storage掃除
    // ========================================================

    let storageCleanupWarning =
      false;


    if (
      storagePaths.length > 0
    ) {
      const {
        error:
          storageDeleteError,
      } =
        await supabaseAdmin
          .storage
          .from(
            PRODUCT_IMAGE_BUCKET
          )
          .remove(
            storagePaths
          );


      if (
        storageDeleteError
      ) {
        storageCleanupWarning =
          true;


        console.error(
          "Private Storage cleanup error:",
          storageDeleteError
        );
      }
    }


    // ========================================================
    // 完了
    // ========================================================

    return NextResponse.json({
      success: true,

      message:
        storageCleanupWarning
          ? "販売会を削除しました。Private Storage内に一部画像が残っている可能性があります。"
          : "販売会と公開データを削除しました。",

      marketId:
        market.market_id,

      runtimeSlot:
        market.runtime_slot,

      deletedProductCount:
        productIds.length,

      deletedImageCount:
        storagePaths.length,

      deletedRuntimeImageCount,

      deletedMarketJson,

      catalogUpdated:
        true,

      storageCleanupWarning,
    });

  } catch (error) {
    console.error(
      "Delete market error:",
      error
    );


    const message =
      error instanceof Error
        ? error.message
        : "販売会の削除中に不明なエラーが発生しました。";


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