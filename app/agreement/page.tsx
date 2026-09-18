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
// ページ
// ============================================================

export default function AgreementPage() {
  const router =
    useRouter();


  const [
    supabase,
  ] =
    useState(
      () =>
        createClient()
    );


  // ==========================================================
  // 状態
  // ==========================================================

  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);


  const [
    termsAccepted,
    setTermsAccepted,
  ] =
    useState(false);


  const [
    privacyAccepted,
    setPrivacyAccepted,
  ] =
    useState(false);


  const [
    guidelinesAccepted,
    setGuidelinesAccepted,
  ] =
    useState(false);


  // ==========================================================
  // 初回ユーザー判定
  // ==========================================================

  const [
    isFirstUse,
    setIsFirstUse,
  ] =
    useState(false);


  // ==========================================================
  // 初回確認
  // ==========================================================

  useEffect(() => {
    checkAgreement();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // ==========================================================
  // 規約状況確認
  // ==========================================================

  async function checkAgreement() {
    setLoading(
      true
    );


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
    // 過去に一度でも同意したことがあるか確認
    //
    // ここで履歴が0件なら
    // 「VRC Live Marketを初めて使うユーザー」と判断する
    // --------------------------------------------------------

    const {
      data:
        previousConsents,

      error:
        previousConsentError,
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
        .limit(
          1
        );


    if (
      previousConsentError
    ) {
      console.error(
        "Previous consent check error:",
        previousConsentError
      );

      setLoading(
        false
      );

      return;
    }


    const hasPreviousConsent =
      (
        previousConsents ??
        []
      ).length >
      0;


    setIsFirstUse(
      !hasPreviousConsent
    );


    // --------------------------------------------------------
    // 現在の規約バージョンに同意済みか確認
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

      setLoading(
        false
      );

      return;
    }


    // --------------------------------------------------------
    // 現在の規約にすでに同意済み
    // --------------------------------------------------------

    if (
      consent
    ) {
      router.replace(
        "/"
      );

      return;
    }


    setLoading(
      false
    );
  }


  // ==========================================================
  // 同意
  // ==========================================================

  async function handleAgree() {
    if (
      !termsAccepted ||
      !privacyAccepted ||
      !guidelinesAccepted
    ) {
      return;
    }


    if (
      submitting
    ) {
      return;
    }


    setSubmitting(
      true
    );


    try {

      // ------------------------------------------------------
      // ユーザー取得
      // ------------------------------------------------------

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
        userError ||
        !user
      ) {
        alert(
          "ログイン情報を確認できませんでした。"
        );

        router.replace(
          "/login"
        );

        return;
      }


      // ------------------------------------------------------
      // 同意履歴保存
      // ------------------------------------------------------

      const {
        error:
          insertError,
      } =
        await supabase
          .from(
            "user_consents"
          )
          .insert({
            user_id:
              user.id,

            terms_version:
              TERMS_VERSION,

            privacy_version:
              PRIVACY_VERSION,

            guidelines_version:
              GUIDELINES_VERSION,
          });


      if (
        insertError
      ) {

        // ----------------------------------------------------
        // 連打等ですでに同じ同意履歴が存在する場合は再確認
        // ----------------------------------------------------

        const {
          data:
            existingConsent,

          error:
            existingConsentError,
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
          existingConsentError ||
          !existingConsent
        ) {
          throw insertError;
        }
      }


      // ------------------------------------------------------
      // 初回ユーザーだけガイドへ
      // ------------------------------------------------------

      if (
        isFirstUse
      ) {
        router.replace(
          "/guide"
        );
      } else {
        router.replace(
          "/"
        );
      }


      router.refresh();

    } catch (
      error
    ) {
      console.error(
        "Agreement save error:",
        error
      );


      alert(
        "同意情報の保存に失敗しました。もう一度お試しください。"
      );

    } finally {
      setSubmitting(
        false
      );
    }
  }


  // ==========================================================
  // Loading
  // ==========================================================

  if (
    loading
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">

        <div className="text-center">

          <p className="text-sm text-slate-400">
            利用状況を確認しています...
          </p>

        </div>

      </main>
    );
  }


  // ==========================================================
  // UI
  // ==========================================================

  const allAccepted =
    termsAccepted &&
    privacyAccepted &&
    guidelinesAccepted;


  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">


        {/* ====================================================
            Header
        ==================================================== */}

        <header>

          <p className="text-sm font-semibold tracking-[0.2em] text-emerald-400">
            VRC LIVE MARKET
          </p>


          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            ご利用を開始する前に
          </h1>


          <p className="mt-4 leading-relaxed text-slate-400">
            VRC Live Marketを安全にご利用いただくため、
            以下の内容をご確認ください。
          </p>

        </header>


        {/* ====================================================
            初回案内
        ==================================================== */}

        {isFirstUse && (

          <div className="mt-8 rounded-xl border border-emerald-900 bg-emerald-950/20 p-4">

            <p className="text-sm font-semibold text-emerald-300">
              はじめてご利用の方へ
            </p>


            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              規約への同意後、
              VRC Live Marketの使い方をご案内します。
            </p>

          </div>

        )}


        {/* ====================================================
            規約一覧
        ==================================================== */}

        <div className="mt-10 space-y-4">


          {/* 利用規約 */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <label className="flex cursor-pointer items-start gap-4">

              <input
                type="checkbox"

                checked={
                  termsAccepted
                }

                onChange={(
                  event
                ) =>
                  setTermsAccepted(
                    event.target.checked
                  )
                }

                className="mt-1 h-5 w-5 shrink-0 accent-emerald-500"
              />


              <div className="min-w-0">

                <p className="font-semibold">
                  利用規約に同意します
                </p>


                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  VRC Live Marketの利用条件、
                  販売者の責任、
                  禁止事項などを定めています。
                </p>


                <Link
                  href="/terms"

                  target="_blank"

                  className="mt-3 inline-block text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
                >
                  利用規約を読む →
                </Link>

              </div>

            </label>

          </section>


          {/* プライバシーポリシー */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <label className="flex cursor-pointer items-start gap-4">

              <input
                type="checkbox"

                checked={
                  privacyAccepted
                }

                onChange={(
                  event
                ) =>
                  setPrivacyAccepted(
                    event.target.checked
                  )
                }

                className="mt-1 h-5 w-5 shrink-0 accent-emerald-500"
              />


              <div className="min-w-0">

                <p className="font-semibold">
                  プライバシーポリシーに同意します
                </p>


                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  アカウント情報や販売会データ等の
                  取り扱いについて定めています。
                </p>


                <Link
                  href="/privacy"

                  target="_blank"

                  className="mt-3 inline-block text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
                >
                  プライバシーポリシーを読む →
                </Link>

              </div>

            </label>

          </section>


          {/* ガイドライン */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <label className="flex cursor-pointer items-start gap-4">

              <input
                type="checkbox"

                checked={
                  guidelinesAccepted
                }

                onChange={(
                  event
                ) =>
                  setGuidelinesAccepted(
                    event.target.checked
                  )
                }

                className="mt-1 h-5 w-5 shrink-0 accent-emerald-500"
              />


              <div className="min-w-0">

                <p className="font-semibold">
                  禁止商品・利用上の注意を確認しました
                </p>


                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  取り扱えない商品や、
                  ライブ販売を行う際の注意事項を定めています。
                </p>


                <Link
                  href="/guidelines"

                  target="_blank"

                  className="mt-3 inline-block text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
                >
                  禁止商品・利用上の注意を読む →
                </Link>

              </div>

            </label>

          </section>

        </div>


        {/* ====================================================
            同意ボタン
        ==================================================== */}

        <button
          type="button"

          onClick={
            handleAgree
          }

          disabled={
            !allAccepted ||
            submitting
          }

          className="mt-8 min-h-14 w-full rounded-xl bg-emerald-500 px-6 py-4 text-lg font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-30"
        >

          {submitting
            ? "保存しています..."
            : isFirstUse
              ? "同意して使い方を見る"
              : "同意して利用を続ける"}

        </button>


        {!allAccepted && (

          <p className="mt-3 text-center text-sm text-slate-500">
            3つすべてをご確認のうえチェックしてください。
          </p>

        )}


        {/* ====================================================
            Beta
        ==================================================== */}

        <div className="mt-10 rounded-xl border border-amber-900 bg-amber-950/20 p-4">

          <p className="text-sm font-semibold text-amber-300">
            Closed Beta
          </p>


          <p className="mt-1 text-sm leading-relaxed text-slate-400">
            VRC Live Marketは現在開発中です。
            正式公開までに機能や利用条件が変更される場合があります。
          </p>

        </div>


        {/* ====================================================
            非公式表記
        ==================================================== */}

        <p className="mt-8 text-xs leading-relaxed text-slate-600">
          VRC Live MarketはVRChat Inc.とは独立して開発されており、
          VRChat Inc.の公式サービスではありません。
        </p>

      </div>

    </main>
  );
}