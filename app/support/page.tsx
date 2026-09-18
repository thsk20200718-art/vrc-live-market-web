"use client";

import Link from "next/link";

import {
  useState,
} from "react";


// ============================================================
// Environment
// ============================================================

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ??
  "";


// ============================================================
// ページ
// ============================================================

export default function SupportPage() {
  const [
    copied,
    setCopied,
  ] =
    useState(false);


  const [
    copyError,
    setCopyError,
  ] =
    useState("");


  const hasSupportEmail =
    SUPPORT_EMAIL
      .trim()
      .length >
    0;


  // ==========================================================
  // Gmailリンク
  // ==========================================================

  const subject =
    "UruBooth お問い合わせ";


  const gmailHref =
    hasSupportEmail
      ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
          SUPPORT_EMAIL
        )}&su=${encodeURIComponent(
          subject
        )}`
      : "";


  // ==========================================================
  // コピー
  // ==========================================================

  async function copySupportEmail() {
    if (
      !hasSupportEmail
    ) {
      return;
    }


    setCopied(
      false
    );

    setCopyError(
      ""
    );


    try {
      await navigator
        .clipboard
        .writeText(
          SUPPORT_EMAIL
        );


      setCopied(
        true
      );


      window.setTimeout(
        () => {
          setCopied(
            false
          );
        },
        2500
      );

    } catch (
      error
    ) {
      console.error(
        "Support email copy error:",
        error
      );


      setCopyError(
        "メールアドレスをコピーできませんでした。"
      );
    }
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">


        {/* ====================================================
            Header
        ==================================================== */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <p className="text-sm font-semibold tracking-[0.25em] text-emerald-400">
              UruBooth
            </p>


            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              サポート
            </h1>


            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
              UruBoothの使い方、不具合、
              Closed Betaについてのお問い合わせはこちらです。
            </p>

          </div>


          <Link
            href="/"

            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            ← 販売会管理へ戻る
          </Link>

        </div>


        {/* ====================================================
            FAQ
        ==================================================== */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">

          <h2 className="text-xl font-bold">
            まず確認してください
          </h2>


          <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-400">


            <div className="rounded-xl bg-slate-950 p-4">

              <p className="font-semibold text-slate-200">
                使い方が分からない
              </p>


              <p className="mt-2">
                販売会の作成、商品登録、公開、
                販売開始・終了については
                はじめての使い方ページをご確認ください。
              </p>


              <Link
                href="/guide"

                className="mt-4 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-slate-800"
              >
                使い方を見る
              </Link>

            </div>


            <div className="rounded-xl bg-slate-950 p-4">

              <p className="font-semibold text-slate-200">
                ログインできない
              </p>


              <p className="mt-2">
                メールアドレスとパスワードをご確認ください。
                パスワードを忘れた場合は再設定できます。
              </p>


              <Link
                href="/forgot-password"

                className="mt-4 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-slate-800"
              >
                パスワードを再設定
              </Link>

            </div>


            <div className="rounded-xl bg-slate-950 p-4">

              <p className="font-semibold text-slate-200">
                VRChat側に反映されない
              </p>


              <p className="mt-2">
                販売会が公開済みになっているか、
                商品情報が保存されているか、
                VRChat側が正しい販売会を読み込んでいるか確認してください。
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            Bug Report
        ==================================================== */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">

          <h2 className="text-xl font-bold">
            不具合を報告するとき
          </h2>


          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            次の情報があると原因を確認しやすくなります。
          </p>


          <div className="mt-5 space-y-3 text-sm text-slate-400">

            <p>
              ・何をしようとしたか
            </p>

            <p>
              ・何が起きたか
            </p>

            <p>
              ・表示されたエラーメッセージ
            </p>

            <p>
              ・問題が発生したページ
            </p>

            <p>
              ・VRChat側の問題の場合は販売会ID
            </p>

            <p>
              ・可能であればスクリーンショット
            </p>

          </div>


          <div className="mt-6 rounded-xl border border-amber-900/60 bg-amber-950/20 p-4">

            <p className="text-sm font-semibold text-amber-300">
              秘密情報は送らないでください
            </p>


            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              パスワード、Supabase Secret Key、
              GitHub Token、APIキーなどは送信しないでください。
            </p>

          </div>

        </section>


        {/* ====================================================
            Contact
        ==================================================== */}

        <section className="mt-8 rounded-2xl border border-emerald-900/60 bg-emerald-950/20 p-5 sm:p-7">

          <h2 className="text-xl font-bold text-emerald-300">
            お問い合わせ
          </h2>


          {hasSupportEmail ? (

            <>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Gmailから問い合わせるか、
                メールアドレスをコピーしてお使いのメールサービスから送信してください。
              </p>


              <div className="mt-6 grid gap-3 sm:grid-cols-2">


                {/* Gmail */}

                <a
                  href={
                    gmailHref
                  }

                  target="_blank"

                  rel="noopener noreferrer"

                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 text-center font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Gmailで問い合わせる
                </a>


                {/* Copy */}

                <button
                  type="button"

                  onClick={
                    copySupportEmail
                  }

                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-900 hover:text-white"
                >

                  {copied
                    ? "✓ コピーしました"
                    : "メールアドレスをコピー"}

                </button>

              </div>


              <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">

                <p className="text-xs text-slate-500">
                  問い合わせ先
                </p>


                <p className="mt-2 break-all text-sm font-medium text-slate-300">
                  {SUPPORT_EMAIL}
                </p>

              </div>


              {copyError && (

                <div className="mt-4 rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
                  {copyError}
                </div>

              )}


              <p className="mt-5 text-xs leading-relaxed text-slate-500">
                Gmailを利用していない場合は、
                「メールアドレスをコピー」から問い合わせ先をコピーし、
                普段お使いのメールサービスをご利用ください。
              </p>

            </>

          ) : (

            <>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                現在、問い合わせ先を準備中です。
                Closed Beta中の連絡方法については、
                招待時に案内された連絡先をご利用ください。
              </p>


              <div className="mt-5 rounded-xl bg-slate-950 p-4">

                <p className="text-xs leading-relaxed text-slate-500">
                  管理者向け：
                  環境変数
                  NEXT_PUBLIC_SUPPORT_EMAIL
                  を設定すると、
                  このページに問い合わせ機能が表示されます。
                </p>

              </div>

            </>

          )}

        </section>


        {/* ====================================================
            Policies
        ==================================================== */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">

          <h2 className="text-xl font-bold">
            ルール・ポリシー
          </h2>


          <div className="mt-5 flex flex-wrap gap-3">

            <Link
              href="/terms"

              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              利用規約
            </Link>


            <Link
              href="/privacy"

              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              プライバシーポリシー
            </Link>


            <Link
              href="/guidelines"

              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              利用上の注意
            </Link>

          </div>

        </section>


        {/* ====================================================
            Footer
        ==================================================== */}

        <div className="mt-10 border-t border-slate-800 pt-6">

          <p className="text-center text-xs leading-relaxed text-slate-600">
            UruBoothはVRChat Inc.とは独立して開発されており、
            VRChat Inc.の公式サービスではありません。
          </p>

        </div>

      </div>

    </main>
  );
}