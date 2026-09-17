import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// 型
// ============================================================

type Market = {
  id: string;
  user_id: string;
  market_id: string;
  title: string;

  seller_display_names: string[];
  staff_display_names: string[];

  stream_url: string;

  status: string;
  runtime_slot: number | null;
};

type Product = {
  id: string;
  market_id: string;
  sort_order: number;

  name: string;
  price: number;
  description: string;

  initial_state:
    | "AVAILABLE"
    | "HOLD"
    | "SOLD";
};

type ProductImage = {
  id: string;
  product_id: string;
  sort_order: number;
  storage_path: string;
};

type RuntimeProduct = {
  name: string;
  price: number;
  description: string;

  initialState:
    | "AVAILABLE"
    | "HOLD"
    | "SOLD";

  imageSlots: number[];
};

type RuntimeMarket = {
  schemaVersion: number;

  marketId: string;
  title: string;

  sellerDisplayNames: string[];
  staffDisplayNames: string[];
  authorizedDisplayNames: string[];

  streamUrl: string;

  products: RuntimeProduct[];
};

type CatalogMarket = {
  marketId: string;
  slot: number;
  title: string;

  authorizedDisplayNames: string[];
};

type GitHubFileInfo = {
  sha?: string;
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

// ============================================================
// 販売者＋スタッフ
// ============================================================

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
// GitHub上のファイル確認
// ============================================================

async function getGitHubFileInfo(
  filePath: string
): Promise<
  GitHubFileInfo | null
> {
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
    response.status === 404
  ) {
    return null;
  }

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `GitHubファイル確認に失敗しました: ${response.status} ${errorText}`
    );
  }

  return (
    await response.json()
  ) as GitHubFileInfo;
}

// ============================================================
// GitHubへ書き込み
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
    filePath
      .split("/")
      .map(
        encodeURIComponent
      )
      .join("/");

  const buffer =
    typeof content ===
    "string"
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

  if (currentFile?.sha) {
    body.sha =
      currentFile.sha;
  }

  const response =
    await githubFetch(
      `/contents/${encodedPath}`,
      {
        method: "PUT",

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
// Runtime Slot確保
// ============================================================

async function ensureRuntimeSlot(
  supabaseAdmin:
    ReturnType<
      typeof createClient
    >,

  market: Market
) {
  if (
    market.runtime_slot !==
    null
  ) {
    return market.runtime_slot;
  }

  for (
    let attempt = 0;
    attempt < 5;
    attempt++
  ) {
    const {
      data: usedMarkets,
      error: usedError,
    } =
      await supabaseAdmin
        .from("markets")
        .select(
          "runtime_slot"
        )
        .not(
          "runtime_slot",
          "is",
          null
        );

    if (usedError) {
      throw new Error(
        `使用中スロットを取得できませんでした: ${usedError.message}`
      );
    }

    const usedSlots =
      new Set<number>();

    for (
      const item of
        usedMarkets ?? []
    ) {
      if (
        item.runtime_slot !==
        null
      ) {
        usedSlots.add(
          item.runtime_slot
        );
      }
    }

    let freeSlot:
      | number
      | null = null;

    for (
      let slot = 0;
      slot < 64;
      slot++
    ) {
      if (
        !usedSlots.has(slot)
      ) {
        freeSlot = slot;
        break;
      }
    }

    if (
      freeSlot === null
    ) {
      throw new Error(
        "VRChat用のRuntime Slotがすべて使用されています。"
      );
    }

    const {
      data:
        updatedMarket,
      error:
        updateError,
    } =
      await supabaseAdmin
        .from("markets")
        .update({
          runtime_slot:
            freeSlot,
        })
        .eq(
          "id",
          market.id
        )
        .is(
          "runtime_slot",
          null
        )
        .select(
          "runtime_slot"
        )
        .maybeSingle();

    if (
      !updateError &&
      updatedMarket?.runtime_slot !==
        null &&
      updatedMarket?.runtime_slot !==
        undefined
    ) {
      return updatedMarket
        .runtime_slot;
    }

    const {
      data:
        latestMarket,
      error:
        latestError,
    } =
      await supabaseAdmin
        .from("markets")
        .select(
          "runtime_slot"
        )
        .eq(
          "id",
          market.id
        )
        .single();

    if (latestError) {
      throw new Error(
        `Runtime Slotの確認に失敗しました: ${latestError.message}`
      );
    }

    if (
      latestMarket.runtime_slot !==
      null
    ) {
      return latestMarket
        .runtime_slot;
    }
  }

  throw new Error(
    "Runtime Slotを確保できませんでした。"
  );
}

// ============================================================
// POST
// ============================================================

export async function POST(
  request: NextRequest,

  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // ========================================================
    // Market UUID
    // ========================================================

    const {
      id: marketUuid,
    } =
      await context.params;

    // ========================================================
    // 環境変数
    // ========================================================

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

    // ========================================================
    // Authorization
    // ========================================================

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
          error:
            "ログイン情報が送信されていません。",
        },
        {
          status: 401,
        }
      );
    }

    const accessToken =
      authHeader
        .slice(7)
        .trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          error:
            "アクセストークンがありません。",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================================
    // ユーザー確認用Supabase
    // ========================================================

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
      data: userData,
      error: userError,
    } =
      await supabaseUser
        .auth
        .getUser();

    if (
      userError ||
      !userData.user
    ) {
      return NextResponse.json(
        {
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
    // Admin Supabase
    // ========================================================

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

    // ========================================================
    // 販売会
    // ========================================================

    const {
      data: marketData,
      error: marketError,
    } =
      await supabaseAdmin
        .from("markets")
        .select("*")
        .eq(
          "id",
          marketUuid
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle();

    if (marketError) {
      throw new Error(
        `販売会取得に失敗しました: ${marketError.message}`
      );
    }

    if (!marketData) {
      return NextResponse.json(
        {
          error:
            "販売会が見つからないか、公開する権限がありません。",
        },
        {
          status: 404,
        }
      );
    }

    const market =
      marketData as Market;

    // ========================================================
    // 権限
    // ========================================================

    const sellerDisplayNames =
      cleanDisplayNames(
        market
          .seller_display_names
      );

    const staffDisplayNames =
      cleanDisplayNames(
        market
          .staff_display_names
      );

    const authorizedDisplayNames =
      buildAuthorizedDisplayNames(
        sellerDisplayNames,
        staffDisplayNames
      );

    if (
      sellerDisplayNames.length ===
      0
    ) {
      return NextResponse.json(
        {
          error:
            "VRChat販売者名が設定されていません。",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // 配信URL
    // ========================================================

    const streamUrl =
      (
        market.stream_url ??
        ""
      ).trim();

    // ========================================================
    // 商品
    // ========================================================

    const {
      data: productData,
      error: productError,
    } =
      await supabaseAdmin
        .from("products")
        .select("*")
        .eq(
          "market_id",
          marketUuid
        )
        .order(
          "sort_order",
          {
            ascending: true,
          }
        );

    if (productError) {
      throw new Error(
        `商品を取得できませんでした: ${productError.message}`
      );
    }

    const products =
      (productData ??
        []) as Product[];

    if (
      products.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "商品が1件もありません。",
        },
        {
          status: 400,
        }
      );
    }

    if (
      products.length > 64
    ) {
      return NextResponse.json(
        {
          error:
            "商品は最大64件までです。",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // 商品画像
    // ========================================================

    const productIds =
      products.map(
        (product) =>
          product.id
      );

    const {
      data: imageData,
      error: imageError,
    } =
      await supabaseAdmin
        .from(
          "product_images"
        )
        .select("*")
        .in(
          "product_id",
          productIds
        )
        .order(
          "sort_order",
          {
            ascending: true,
          }
        );

    if (imageError) {
      throw new Error(
        `商品画像情報を取得できませんでした: ${imageError.message}`
      );
    }

    const productImages =
      (imageData ??
        []) as ProductImage[];

    // ========================================================
    // 商品別画像
    // ========================================================

    const imagesByProduct =
      new Map<
        string,
        ProductImage[]
      >();

    for (
      const product of products
    ) {
      imagesByProduct.set(
        product.id,
        []
      );
    }

    for (
      const image of
        productImages
    ) {
      const list =
        imagesByProduct.get(
          image.product_id
        );

      if (list) {
        list.push(image);
      }
    }

    for (
      const list of
        imagesByProduct.values()
    ) {
      list.sort(
        (a, b) =>
          a.sort_order -
          b.sort_order
      );
    }

    // ========================================================
    // 画像必須チェック
    // ========================================================

    for (
      const product of products
    ) {
      const images =
        imagesByProduct.get(
          product.id
        ) ?? [];

      if (
        images.length === 0
      ) {
        return NextResponse.json(
          {
            error:
              `「${product.name}」に商品写真がありません。`,
          },
          {
            status: 400,
          }
        );
      }
    }

    if (
      productImages.length > 64
    ) {
      return NextResponse.json(
        {
          error:
            "商品写真は販売会全体で最大64枚までです。",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // Runtime Slot
    // ========================================================

    const runtimeSlot =
      await ensureRuntimeSlot(
        supabaseAdmin,
        market
      );

    const slotFolder =
      String(
        runtimeSlot
      ).padStart(
        2,
        "0"
      );

    // ========================================================
    // Runtime商品
    // ========================================================

    const runtimeProducts:
      RuntimeProduct[] = [];

    let nextImageSlot = 0;

    // ========================================================
    // 画像処理
    // ========================================================

    for (
      const product of products
    ) {
      const images =
        imagesByProduct.get(
          product.id
        ) ?? [];

      const imageSlots:
        number[] = [];

      for (
        const image of images
      ) {
        const imageSlot =
          nextImageSlot;

        nextImageSlot++;

        imageSlots.push(
          imageSlot
        );

        // ----------------------------------------------------
        // private画像取得
        // ----------------------------------------------------

        const {
          data:
            downloadedFile,
          error:
            downloadError,
        } =
          await supabaseAdmin
            .storage
            .from(
              "product-images-private"
            )
            .download(
              image.storage_path
            );

        if (
          downloadError ||
          !downloadedFile
        ) {
          throw new Error(
            `「${product.name}」の画像を取得できませんでした: ${
              downloadError?.message ??
              "Unknown error"
            }`
          );
        }

        const originalBuffer =
          Buffer.from(
            await downloadedFile
              .arrayBuffer()
          );

        // ----------------------------------------------------
        // JPEG化
        // ----------------------------------------------------

        const jpegBuffer =
          await sharp(
            originalBuffer
          )
            .rotate()
            .resize({
              width: 1600,

              height: 1600,

              fit:
                "inside",

              withoutEnlargement:
                true,
            })
            .jpeg({
              quality: 82,

              mozjpeg: true,
            })
            .toBuffer();

        const imageFileName =
          `${String(
            imageSlot
          ).padStart(
            2,
            "0"
          )}.jpg`;

        const githubImagePath =
          `runtime/slots/${slotFolder}/images/${imageFileName}`;

        await putGitHubFile(
          githubImagePath,

          jpegBuffer,

          `Publish ${market.market_id} image ${imageFileName}`
        );
      }

      runtimeProducts.push({
        name:
          product.name,

        price:
          product.price,

        description:
          product.description,

        initialState:
          product.initial_state,

        imageSlots,
      });
    }

    // ========================================================
    // market.json
    // ========================================================

    const runtimeMarket:
      RuntimeMarket = {
      schemaVersion: 1,

      marketId:
        market.market_id,

      title:
        market.title,

      sellerDisplayNames,

      staffDisplayNames,

      authorizedDisplayNames,

      streamUrl,

      products:
        runtimeProducts,
    };

    const marketJson =
      JSON.stringify(
        runtimeMarket,
        null,
        2
      ) + "\n";

    await putGitHubFile(
      `runtime/slots/${slotFolder}/market.json`,

      marketJson,

      `Publish ${market.market_id} market data`
    );

    // ========================================================
    // catalog.json
    // ========================================================

    const {
      data:
        publishedMarketData,

      error:
        publishedMarketError,
    } =
      await supabaseAdmin
        .from("markets")
        .select(
          "id, market_id, title, seller_display_names, staff_display_names, runtime_slot, status"
        )
        .not(
          "runtime_slot",
          "is",
          null
        );

    if (
      publishedMarketError
    ) {
      throw new Error(
        `catalog用販売会一覧を取得できませんでした: ${publishedMarketError.message}`
      );
    }

    const catalogMarkets =
      new Map<
        string,
        CatalogMarket
      >();

    for (
      const item of
        publishedMarketData ??
        []
    ) {
      if (
        item.runtime_slot ===
        null
      ) {
        continue;
      }

      if (
        item.status !==
          "published" &&
        item.id !== market.id
      ) {
        continue;
      }

      const itemSellerNames =
        cleanDisplayNames(
          item
            .seller_display_names
        );

      const itemStaffNames =
        cleanDisplayNames(
          item
            .staff_display_names
        );

      const itemAuthorizedNames =
        buildAuthorizedDisplayNames(
          itemSellerNames,
          itemStaffNames
        );

      catalogMarkets.set(
        item.market_id,
        {
          marketId:
            item.market_id,

          slot:
            item.runtime_slot,

          title:
            item.title,

          authorizedDisplayNames:
            itemAuthorizedNames,
        }
      );
    }

    catalogMarkets.set(
      market.market_id,
      {
        marketId:
          market.market_id,

        slot:
          runtimeSlot,

        title:
          market.title,

        authorizedDisplayNames,
      }
    );

    const sortedCatalogMarkets =
      Array.from(
        catalogMarkets.values()
      ).sort(
        (a, b) =>
          a.slot - b.slot
      );

    const catalogJson =
      JSON.stringify(
        {
          markets:
            sortedCatalogMarkets,
        },
        null,
        2
      ) + "\n";

    // ========================================================
    // catalogは最後
    // ========================================================

    await putGitHubFile(
      "runtime/catalog.json",

      catalogJson,

      `Update catalog for ${market.market_id}`
    );

    // ========================================================
    // 公開状態更新
    // ========================================================

    const {
      error:
        publishStateError,
    } =
      await supabaseAdmin
        .from("markets")
        .update({
          status:
            "published",

          runtime_slot:
            runtimeSlot,

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          market.id
        );

    if (
      publishStateError
    ) {
      throw new Error(
        `公開状態を保存できませんでした: ${publishStateError.message}`
      );
    }

    // ========================================================
    // 成功
    // ========================================================

    return NextResponse.json({
      success: true,

      marketId:
        market.market_id,

      runtimeSlot,

      productCount:
        products.length,

      imageCount:
        productImages.length,

      operatorCount:
        authorizedDisplayNames.length,

      streamConfigured:
        streamUrl.length > 0,

      message:
        "販売会を公開しました。",
    });

  } catch (error) {
    console.error(
      "Publish error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "公開処理中に不明なエラーが発生しました。";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}