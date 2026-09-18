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
    productId: string;
  }>;
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
    // URL Param
    // ========================================================

    const {
      id: marketUuid,
      productId,
    } =
      await context.params;


    if (
      !marketUuid ||
      !productId
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "販売会IDまたは商品IDがありません。",
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
      authorization
        .replace(
          "Bearer ",
          ""
        )
        .trim();


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
    // User確認
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
        "Delete product auth error:",
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
          "id, user_id, market_id, title, status"
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
            "この商品の削除権限がありません。",
        },
        {
          status: 403,
        }
      );
    }


    // ========================================================
    // 公開中は削除禁止
    // ========================================================

    if (
      market.status ===
      "published"
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "公開中の販売会の商品は削除できません。先に販売会の公開を解除してください。",
        },
        {
          status: 409,
        }
      );
    }


    // ========================================================
    // 商品確認
    // ========================================================

    const {
      data:
        product,

      error:
        productError,
    } =
      await supabaseAdmin
        .from("products")
        .select(
          "id, market_id, name, sort_order"
        )
        .eq(
          "id",
          productId
        )
        .eq(
          "market_id",
          marketUuid
        )
        .single();


    if (
      productError ||
      !product
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "商品が見つかりません。",
        },
        {
          status: 404,
        }
      );
    }


    // ========================================================
    // 商品画像取得
    // ========================================================

    const {
      data:
        imageRows,

      error:
        imageLoadError,
    } =
      await supabaseAdmin
        .from(
          "product_images"
        )
        .select(
          "id, storage_path"
        )
        .eq(
          "product_id",
          productId
        );


    if (
      imageLoadError
    ) {
      throw new Error(
        `商品画像情報を取得できませんでした: ${imageLoadError.message}`
      );
    }


    const storagePaths =
      (
        imageRows ?? []
      )
        .map(
          (image) =>
            image.storage_path
        )
        .filter(
          (
            path
          ): path is string =>
            typeof path ===
              "string" &&
            path.length > 0
        );


    // ========================================================
    // product_images削除
    // ========================================================

    const {
      error:
        imageDeleteError,
    } =
      await supabaseAdmin
        .from(
          "product_images"
        )
        .delete()
        .eq(
          "product_id",
          productId
        );


    if (
      imageDeleteError
    ) {
      throw new Error(
        `商品画像情報の削除に失敗しました: ${imageDeleteError.message}`
      );
    }


    // ========================================================
    // 商品削除
    // ========================================================

    const {
      error:
        productDeleteError,
    } =
      await supabaseAdmin
        .from("products")
        .delete()
        .eq(
          "id",
          productId
        )
        .eq(
          "market_id",
          marketUuid
        );


    if (
      productDeleteError
    ) {
      throw new Error(
        `商品の削除に失敗しました: ${productDeleteError.message}`
      );
    }


    // ========================================================
    // sort_order詰め直し
    // ========================================================

    const {
      data:
        remainingProducts,

      error:
        remainingProductsError,
    } =
      await supabaseAdmin
        .from("products")
        .select(
          "id, sort_order"
        )
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


    if (
      remainingProductsError
    ) {
      console.error(
        "Product reorder load error:",
        remainingProductsError
      );
    } else {
      const items =
        remainingProducts ?? [];


      for (
        let index = 0;
        index < items.length;
        index++
      ) {
        const current =
          items[index];


        if (
          current.sort_order ===
          index
        ) {
          continue;
        }


        const {
          error:
            reorderError,
        } =
          await supabaseAdmin
            .from("products")
            .update({
              sort_order:
                index,
            })
            .eq(
              "id",
              current.id
            );


        if (
          reorderError
        ) {
          console.error(
            "Product reorder error:",
            reorderError
          );
        }
      }
    }


    // ========================================================
    // Private Storage削除
    //
    // DB削除後。
    // Storageだけ失敗しても商品削除は成功扱い。
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
          "Product Storage cleanup error:",
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
          ? "商品を削除しました。Storage内に一部画像が残っている可能性があります。"
          : "商品を削除しました。",

      productId:
        product.id,

      productName:
        product.name,

      deletedImageCount:
        storagePaths.length,

      storageCleanupWarning,
    });

  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );


    const message =
      error instanceof Error
        ? error.message
        : "商品削除中に不明なエラーが発生しました。";


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