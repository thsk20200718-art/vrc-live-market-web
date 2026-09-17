import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// 環境変数
// ============================================================

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `環境変数 ${name} が設定されていません。`
    );
  }

  return value;
}

// ============================================================
// 配信URL形式チェック
// ============================================================

function isValidStreamUrl(value: string) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}

// ============================================================
// GET
//
// /api/stream/00
// /api/stream/01
// ...
// /api/stream/63
// ============================================================

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      slot: string;
    }>;
  }
) {
  try {
    // ========================================================
    // Slot取得
    // ========================================================

    const { slot } = await context.params;

    const slotNumber = Number.parseInt(slot, 10);

    if (
      !Number.isInteger(slotNumber) ||
      slotNumber < 0 ||
      slotNumber > 63
    ) {
      return NextResponse.json(
        {
          error: "Runtime Slotが正しくありません。",
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ========================================================
    // Supabase接続
    // ========================================================

    const supabaseUrl = getRequiredEnv(
      "NEXT_PUBLIC_SUPABASE_URL"
    );

    const secretKey = getRequiredEnv(
      "SUPABASE_SECRET_KEY"
    );

    const supabaseAdmin = createClient(
      supabaseUrl,
      secretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // ========================================================
    // Runtime Slotに対応する公開販売会を探す
    // ========================================================

    const {
      data: market,
      error: marketError,
    } = await supabaseAdmin
      .from("markets")
      .select(
        "market_id, title, stream_url, status, runtime_slot"
      )
      .eq("runtime_slot", slotNumber)
      .eq("status", "published")
      .maybeSingle();

    if (marketError) {
      console.error(
        "Stream gateway lookup error:",
        marketError
      );

      return NextResponse.json(
        {
          error:
            "販売会情報を取得できませんでした。",
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ========================================================
    // 該当販売会なし
    // ========================================================

    if (!market) {
      return NextResponse.json(
        {
          error:
            "このRuntime Slotには公開中の販売会がありません。",
        },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ========================================================
    // 配信URL
    // ========================================================

    const streamUrl = (
      market.stream_url ?? ""
    ).trim();

    if (!streamUrl) {
      return NextResponse.json(
        {
          error:
            "この販売会には配信URLが設定されていません。",
          marketId: market.market_id,
        },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (!isValidStreamUrl(streamUrl)) {
      return NextResponse.json(
        {
          error:
            "登録されている配信URLの形式が正しくありません。",
          marketId: market.market_id,
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ========================================================
    // 302 Redirect
    //
    // Webでstream_urlを変えたら
    // 次回アクセスから即反映させるためキャッシュ禁止
    // ========================================================

    const response = NextResponse.redirect(
      streamUrl,
      302
    );

    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );

    response.headers.set(
      "Pragma",
      "no-cache"
    );

    response.headers.set(
      "Expires",
      "0"
    );

    return response;
  } catch (error) {
    console.error(
      "Stream gateway error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "配信URLの取得中にエラーが発生しました。",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}