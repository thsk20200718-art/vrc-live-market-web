"use client";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  createClient,
} from "@/lib/supabase/client";

import {
  getAuthErrorMessage,
} from "@/lib/auth-errors";


// ============================================================
// ページ
// ============================================================

export default function ForgotPasswordPage() {
  const [
    email,
    setEmail,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    message,
    setMessage,
  ] =
    useState("");


  const [
    success,
    setSuccess,
  ] =
    useState(false);


  // ==========================================================
  // パスワード再設定メール送信
  // ==========================================================

  async function handleSendResetEmail() {
    if (
      loading
    ) {
      return;
    }


    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    if (
      !normalizedEmail
    ) {
      setSuccess(
        false
      );

      setMessage(
        "メールアドレスを入力してください。"
      );

      return;
    }


    setLoading(
      true
    );

    setMessage(
      ""
    );

    setSuccess(
      false
    );


    try {
      const supabase =
        createClient();


      const redirectTo =
        `${window.location.origin}/reset-password`;


      const {
        error,
      } =
        await supabase
          .auth
          .resetPasswordForEmail(
            normalizedEmail,
            {
              redirectTo,
            }
          );


      if (
        error
      ) {
        throw error;
      }


      setSuccess(
        true
      );


      setMessage(
        "パスワード再設定用のメールを送信しました。メールをご確認ください。"
      );

    } catch (
      error
    ) {
      console.error(
        "Password reset email error:",
        error
      );


      setSuccess(
        false
      );


      setMessage(
        getAuthErrorMessage(
          error
        )
      );

    } finally {
      setLoading(
        false
      );
    }
  }


  // ==========================================================
  // Enter
  // ==========================================================

  function handleKeyDown(
    event:
      React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key ===
      "Enter"
    ) {
      handleSendResetEmail();
    }
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-8 sm:px-6 sm:py-10">

        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">


          <p className="text-sm font-semibold tracking-[0.25em] text-emerald-400">
         UruBooth
          </p>


          <h1 className="mt-3 text-3xl font-bold">
            パスワードを忘れた方
          </h1>


          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            登録しているメールアドレスを入力してください。
            パスワード再設定用のメールを送信します。
          </p>


          <div className="mt-8 space-y-5">


            <div>

              <label className="mb-2 block text-sm text-slate-300">
                メールアドレス
              </label>


              <input
                type="email"

                value={
                  email
                }

                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }

                onKeyDown={
                  handleKeyDown
                }

                autoComplete="email"

                placeholder="example@email.com"

                disabled={
                  loading
                }

                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition placeholder:text-slate-600 focus:border-emerald-500 disabled:opacity-50"
              />

            </div>


            {message && (

              <div
                className={
                  success

                    ? "rounded-xl border border-emerald-900 bg-emerald-950/30 p-4 text-sm leading-relaxed text-emerald-300"

                    : "rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm leading-relaxed text-red-300"
                }
              >
                {message}
              </div>

            )}


            <button
              type="button"

              onClick={
                handleSendResetEmail
              }

              disabled={
                loading ||
                !email.trim()
              }

              className="w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {loading
                ? "送信中..."
                : "再設定メールを送信"}

            </button>


            <Link
              href="/login"

              className="flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              ログイン画面へ戻る
            </Link>

          </div>


          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-4">

            <p className="text-xs leading-relaxed text-slate-500">
              メールが届かない場合は、迷惑メールフォルダをご確認ください。
              メール送信が混み合っている場合は、
              少し時間をおいてから再度お試しください。
            </p>

          </div>


          <div className="mt-8 border-t border-slate-800 pt-5">

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">

              <Link
                href="/terms"
                className="text-slate-500 transition hover:text-slate-300"
              >
                利用規約
              </Link>


              <Link
                href="/privacy"
                className="text-slate-500 transition hover:text-slate-300"
              >
                プライバシーポリシー
              </Link>

            </div>


            <p className="mt-5 text-center text-xs leading-relaxed text-slate-600">
              UruBoothはVRChat Inc.とは独立して開発されており、
              VRChat Inc.の公式サービスではありません。
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}