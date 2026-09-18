"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/client";


// ============================================================
// 型
// ============================================================

type Market = {
  id: string;
  title: string;
  market_id: string;
  status: string;
};

type MarketCardData =
  Market & {
    productCount: number;
  };


// ============================================================
// ページ
// ============================================================

export default function Home() {
  const router =
    useRouter();

  const [
    markets,
    setMarkets,
  ] =
    useState<
      MarketCardData[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const [
    openingMarketId,
    setOpeningMarketId,
  ] =
    useState<
      string | null
    >(null);


  // ==========================================================
  // 初回読み込み
  // ==========================================================

  useEffect(() => {
    loadMarkets();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // ==========================================================
  // 販売会読み込み
  // ==========================================================

  async function loadMarkets() {
    setLoading(true);

    setErrorMessage("");

    const supabase =
      createClient();


    // --------------------------------------------------------
    // ログイン確認
    // --------------------------------------------------------

    const {
      data: {
        user,
      },

      error:
        userError,
    } =
      await supabase
        .auth
        .getUser();


    if (
      userError
    ) {
      console.error(
        "User load error:",
        userError
      );

      setErrorMessage(
        "ログイン情報の取得に失敗しました。"
      );

      setLoading(false);

      return;
    }


    if (
      !user
    ) {
      router.replace(
        "/login"
      );

      return;
    }


    // --------------------------------------------------------
    // 販売会取得
    // --------------------------------------------------------

    const {
      data:
        marketData,

      error:
        marketError,
    } =
      await supabase
        .from(
          "markets"
        )
        .select(
          "id, title, market_id, status"
        )
        .eq(
          "user_id",
          user.id
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        );


    if (
      marketError
    ) {
      console.error(
        "Market load error:",
        marketError
      );

      setErrorMessage(
        "販売会の取得に失敗しました。"
      );

      setLoading(false);

      return;
    }


    const marketList =
      marketData ??
      [];


    // --------------------------------------------------------
    // 商品数取得
    // --------------------------------------------------------

    const cards:
      MarketCardData[] =
      [];


    for (
      const market of
      marketList
    ) {
      const {
        count,

        error:
          countError,
      } =
        await supabase
          .from(
            "products"
          )
          .select(
            "*",
            {
              count:
                "exact",

              head:
                true,
            }
          )
          .eq(
            "market_id",
            market.id
          );


      if (
        countError
      ) {
        console.error(
          "Product count error:",
          countError
        );
      }


      cards.push({
        ...market,

        productCount:
          count ??
          0,
      });
    }


    setMarkets(
      cards
    );

    setLoading(
      false
    );
  }


  // ==========================================================
  // 販売会編集画面を開く
  // ==========================================================

  function handleOpenMarket(
    marketId: string
  ) {
    if (
      openingMarketId
    ) {
      return;
    }


    setOpeningMarketId(
      marketId
    );


    router.push(
      `/markets/${marketId}`
    );
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">


        {/* ====================================================
            Header
        ==================================================== */}

        <header className="mb-8 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">


          <div>

            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 sm:text-sm sm:tracking-[0.25em]">
              VRC LIVE MARKET
            </p>


            <h1 className="mt-3 text-2xl font-bold sm:text-4xl">
              販売会を管理
            </h1>


            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
              VRChatで使用する販売会・商品・写真を管理します。
            </p>

          </div>


          {/* 新規作成 */}

          <Link
            href="/create"

            className="relative z-20 inline-flex min-h-12 w-full touch-manipulation items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition active:scale-[0.98] active:bg-emerald-400 sm:w-auto"
          >
            ＋ 新しい販売会を作る
          </Link>

        </header>


        {/* ====================================================
            販売会一覧
        ==================================================== */}

        <section>

          <h2 className="mb-5 text-xl font-semibold">
            あなたの販売会
          </h2>


          {/* Loading */}

          {loading && (

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              販売会を読み込んでいます...
            </div>

          )}


          {/* Error */}

          {!loading &&
            errorMessage && (

            <div className="rounded-2xl border border-red-900 bg-red-950/40 p-6 text-red-300">
              {errorMessage}
            </div>

          )}


          {/* 販売会なし */}

          {!loading &&
            !errorMessage &&
            markets.length ===
              0 && (

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-lg font-semibold">
                まだ販売会がありません
              </p>


              <p className="mt-2 text-sm text-slate-400">
                「新しい販売会を作る」から最初の販売会を作成できます。
              </p>

            </div>

          )}


          {/* 販売会一覧 */}

          {!loading &&
            !errorMessage &&
            markets.length >
              0 && (

            <div className="space-y-4">

              {markets.map(
                (
                  market
                ) => {

                  const isPublished =
                    market.status ===
                    "published";


                  const isOpening =
                    openingMarketId ===
                    market.id;


                  return (

                    <div
                      key={
                        market.id
                      }

                      className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6"
                    >

                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">


                        {/* 販売会情報 */}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-3">

                            <h3 className="break-words text-xl font-bold sm:text-2xl">
                              {market.title}
                            </h3>


                            {isPublished ? (

                              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-400">
                                公開中
                              </span>

                            ) : (

                              <span className="rounded-full bg-slate-700 px-3 py-1 text-sm font-medium text-slate-300">
                                下書き
                              </span>

                            )}

                          </div>


                          <div className="mt-4 space-y-1">

                            <p className="break-all text-sm text-slate-400">
                              Market ID：
                              {market.market_id}
                            </p>


                            <p className="text-sm text-slate-400">
                              商品数：
                              {market.productCount}
                            </p>

                          </div>

                        </div>


                        {/* 編集 */}

                        <div className="relative z-20 w-full shrink-0 sm:w-auto">

                          <button
                            type="button"

                            onClick={() =>
                              handleOpenMarket(
                                market.id
                              )
                            }

                            disabled={
                              isOpening
                            }

                            className="pointer-events-auto relative z-20 flex min-h-12 w-full touch-manipulation select-none items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-6 py-3 font-semibold text-white transition active:scale-[0.98] active:bg-slate-700 disabled:cursor-wait disabled:opacity-50 sm:w-auto sm:hover:bg-slate-800"
                          >

                            {isOpening
                              ? "開いています..."
                              : "編集"}

                          </button>

                        </div>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>

      </div>


      {/* ======================================================
          Footer
      ====================================================== */}

      <footer className="border-t border-slate-800 bg-slate-950">

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-semibold text-slate-300">
                VRC Live Market
              </p>

              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                VRChatでのライブ販売を支援する独立プロジェクトです。
              </p>

            </div>


            <nav className="flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6">

              <Link
                href="/terms"
                className="text-slate-400 transition hover:text-white"
              >
                利用規約
              </Link>

              <Link
                href="/privacy"
                className="text-slate-400 transition hover:text-white"
              >
                プライバシーポリシー
              </Link>

              <Link
                href="/guidelines"
                className="text-slate-400 transition hover:text-white"
              >
                禁止商品・利用上の注意
              </Link>

            </nav>

          </div>


          <div className="mt-6 border-t border-slate-900 pt-5">

            <p className="text-xs leading-relaxed text-slate-600">
              VRC Live MarketはVRChat Inc.とは独立して開発されており、
              VRChat Inc.の公式サービスではありません。
            </p>

          </div>

        </div>

      </footer>

    </main>
  );
}