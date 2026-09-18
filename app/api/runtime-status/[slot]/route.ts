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
// GET
// ============================================================

export async function GET(
  _request:
    NextRequest,

  context: {
    params:
      Promise<{
        slot: string;
      }>;
  }
) {
  try {
    // --------------------------------------------------------
    // Runtime Slot
    // --------------------------------------------------------

    const {
      slot:
        slotValue,
    } =
      await context.params;


    const runtimeSlot =
      Number(
        slotValue
      );


    if (
      !Number.isInteger(
        runtimeSlot
      ) ||
      runtimeSlot <
        0 ||
      runtimeSlot >
        63
    ) {
      return (
        NextResponse.json(
          {
            success:
              false,

            error:
              "Runtime Slotが正しくありません。",
          },
          {
            status:
              400,

            headers: {
              "Cache-Control":
                "no-store, no-cache, must-revalidate, max-age=0",
            },
          }
        )
      );
    }


    // --------------------------------------------------------
    // Supabase
    // --------------------------------------------------------

    const supabaseUrl =
      getRequiredEnv(
        "NEXT_PUBLIC_SUPABASE_URL"
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
    // 販売会取得
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
          "market_id, sale_status, status, runtime_slot, updated_at"
        )
        .eq(
          "runtime_slot",
          runtimeSlot
        )
        .eq(
          "status",
          "published"
        )
        .maybeSingle();


    if (
      marketError
    ) {
      throw new Error(
        `販売状態を取得できませんでした: ${marketError.message}`
      );
    }


    // --------------------------------------------------------
    // Slotに公開中Marketがない
    // --------------------------------------------------------

    if (
      !marketData
    ) {
      return (
        NextResponse.json(
          {
            success:
              false,

            marketFound:
              false,

            slot:
              runtimeSlot,

            saleStatus:
              "READY" as SaleStatus,
          },
          {
            status:
              404,

            headers: {
              "Cache-Control":
                "no-store, no-cache, must-revalidate, max-age=0",

              Pragma:
                "no-cache",

              Expires:
                "0",
            },
          }
        )
      );
    }


    // --------------------------------------------------------
    // Sale Status
    // --------------------------------------------------------

    let saleStatus:
      SaleStatus =
      "READY";


    if (
      marketData
        .sale_status ===
      "LIVE"
    ) {
      saleStatus =
        "LIVE";
    }
    else if (
      marketData
        .sale_status ===
      "ENDED"
    ) {
      saleStatus =
        "ENDED";
    }


    // --------------------------------------------------------
    // 成功
    // --------------------------------------------------------

    return (
      NextResponse.json(
        {
          success:
            true,

          marketFound:
            true,

          slot:
            runtimeSlot,

          marketId:
            marketData
              .market_id,

          saleStatus,

          updatedAt:
            marketData
              .updated_at,
        },
        {
          status:
            200,

          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, max-age=0",

            Pragma:
              "no-cache",

            Expires:
              "0",
          },
        }
      )
    );

  } catch (
    error
  ) {
    console.error(
      "Runtime status API error:",
      error
    );


    const message =
      error instanceof
        Error
        ? error.message
        : "販売状態の取得中に不明なエラーが発生しました。";


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

          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, max-age=0",
          },
        }
      )
    );
  }
}