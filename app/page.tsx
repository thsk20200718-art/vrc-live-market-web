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

import {
  GUIDELINES_VERSION,
  PRIVACY_VERSION,
  TERMS_VERSION,
} from "@/lib/legal";


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


  const [
    loggingOut,
    setLoggingOut,
  ] =
    useState(false);


  const [
    isAdmin,
    setIsAdmin,
  ] =
    useState(false);


  // ==========================================================
  // 初回読み込み
  // ==========================================================

  useEffect(() => {
    loadDashboard();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // ==========================================================
  // Dashboard読み込み
  // ==========================================================

  async function loadDashboard() {
    setLoading(
      true
    );

    setErrorMessage(
      ""
    );


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

      setLoading(
        false
      );

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
    // 利用規約同意確認
    // --------------------------------------------------------

    const {
      data:
        consent,

      error:
        consentError,
    } =
      await supabase
        .from(
          "user_consents"
        )
        .select(
          "id"
        )
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "terms_version",
          TERMS_VERSION
        )
        .eq(
          "privacy_version",
          PRIVACY_VERSION
        )
        .eq(
          "guidelines_version",
          GUIDELINES_VERSION
        )
        .maybeSingle();


    if (
      consentError
    ) {
      console.error(
        "Consent check error:",
        consentError
      );

      setErrorMessage(
        "利用規約の同意状況を確認できませんでした。"
      );

      setLoading(
        false
      );

      return;
    }


    if (
      !consent
    ) {
      router.replace(
        "/agreement"
      );

      return;
    }


    // --------------------------------------------------------
    // 管理者確認
    // --------------------------------------------------------

    const {
      data: {
        session,
      },
    } =
      await supabase
        .auth
        .getSession();


    if (
      session
    ) {
      try {
        const response =
          await fetch(
            "/api/admin/status",
            {
              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },

              cache:
                "no-store",
            }
          );


        const result =
          await response.json();


        if (
          response.ok &&
          result.success
        ) {
          setIsAdmin(
            result.isAdmin ===
            true
          );
        }

      } catch (
        error
      ) {
        console.error(
          "Admin status check error:",
          error
        );

        setIsAdmin(
          false
        );
      }
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

      setLoading(
        false
      );

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
  // 販売会編集
  // ==========================================================

  function handleOpenMarket(
    marketId: string
  ) {
    if (
      openingMarketId ||
      loggingOut
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
  // ログアウト
  // ==========================================================

  async function handleLogout() {
    if (
      loggingOut
    ) {
      return;
    }


    const confirmed =
      window.confirm(
        "ログアウトしますか？"
      );


    if (
      !confirmed
    ) {
      return;
    }


    setLoggingOut(
      true
    );


    try {
      const supabase =
        createClient();


      const {
        error,
      } =
        await supabase
          .auth
          .signOut();


      if (
        error
      ) {
        throw error;
      }


      router.replace(
        "/login"
      );

      router.refresh();

    } catch (
      error
    ) {
      console.error(
        "Logout error:",
        error
      );


      alert(
        "ログアウトに失敗しました。"
      );


      setLoggingOut(
        false
      );
    }
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

        <header className="mb-8 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-start sm:justify-between">


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


          {/* ==================================================
              Header buttons
          ================================================== */}

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">


            {/* 管理者のみ */}

            {isAdmin && (

              <Link
                href="/admin/invites"

                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-amber-700 bg-amber-950/20 px-5 py-3 font-semibold text-amber-300 transition hover:bg-amber-950/40 active:scale-[0.98] sm:w-auto"
              >
                Closed Beta 管理
              </Link>

            )}


            {/* Guide */}

            <Link
              href="/guide"

              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-emerald-800 bg-emerald-950/30 px-5 py-3 font-semibold text-emerald-300 transition hover:bg-emerald-950 active:scale-[0.98] sm:w-auto"
            >
              ? はじめての方へ
            </Link>


            {/* Create */}

            <Link
              href="/create"

              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 active:scale-[0.98] sm:w-auto"
            >
              ＋ 新しい販売会を作る
            </Link>


            {/* Logout */}

            <button
              type="button"

              onClick={
                handleLogout
              }

              disabled={
                loggingOut ||
                loading
              }

              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >

              {loggingOut
                ? "ログアウト中..."
                : "ログアウト"}

            </button>

          </div>

        </header>


        {/* ====================================================
            Market List
        ==================================================== */}

        <section>

          <h2 className="mb-5 text-xl font-semibold">
            あなたの販売会
          </h2>


          {loading && (

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              販売会を読み込んでいます...
            </div>

          )}


          {!loading &&
            errorMessage && (

            <div className="rounded-2xl border border-red-900 bg-red-950/40 p-6 text-red-300">
              {errorMessage}
            </div>

          )}


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


              <Link
                href="/guide"

                className="mt-4 inline-block text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
              >
                初めて利用する方はこちら →
              </Link>

            </div>

          )}


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

                      className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6"
                    >

                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">


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


                        <button
                          type="button"

                          onClick={() =>
                            handleOpenMarket(
                              market.id
                            )
                          }

                          disabled={
                            isOpening ||
                            loggingOut
                          }

                          className="flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 sm:w-auto"
                        >

                          {isOpening
                            ? "開いています..."
                            : "編集"}

                        </button>

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

      <footer className="border-t border-slate-800">

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

          <div className="flex flex-wrap gap-5 text-sm">

            <Link
              href="/guide"
              className="text-slate-400 hover:text-white"
            >
              はじめての方へ
            </Link>

            <Link
              href="/terms"
              className="text-slate-400 hover:text-white"
            >
              利用規約
            </Link>

            <Link
              href="/privacy"
              className="text-slate-400 hover:text-white"
            >
              プライバシーポリシー
            </Link>

            <Link
              href="/guidelines"
              className="text-slate-400 hover:text-white"
            >
              禁止商品・利用上の注意
            </Link>

          </div>


          <p className="mt-6 text-xs leading-relaxed text-slate-600">
            VRC Live MarketはVRChat Inc.とは独立して開発されており、
            VRChat Inc.の公式サービスではありません。
          </p>

        </div>

      </footer>

    </main>
  );
}