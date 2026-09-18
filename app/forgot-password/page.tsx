"use client";

import Link from "next/link";
import { useState } from "react";

import {
  createClient,
} from "@/lib/supabase/client";


export default function ForgotPasswordPage() {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState(false);


  // ==========================================================
  // パスワード再設定メール送信
  // ==========================================================

  async function handleSendResetEmail() {
    if (
      loading ||
      !email
    ) {
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
        await supabase.auth.resetPasswordForEmail(
          email,
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


      setMessage(
        "再設定メールの送信に失敗しました。メールアドレスをご確認ください。"
      );

    } finally {
      setLoading(
        false
      );
    }
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-10">

        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">


          {/* ==================================================
              Header
          ================================================== */}

          <p className="text-sm font-semibold tracking-[0.25em] text-emerald-400">
            VRC LIVE MARKET
          </p>


          <h1 className="mt-3 text-3xl font-bold">
            パスワードを忘れた方
          </h1>


          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            登録しているメールアドレスを入力してください。
            パスワード再設定用のメールを送信します。
          </p>


          {/* ==================================================
              Form
          ================================================== */}

          <div className="mt-8 space-y-5">


            {/* Email */}

            <div>

              <label className="mb-2 block text-sm text-slate-300">
                メールアドレス
              </label>


              <input
                type="email"

                value={
                  email
                }

                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }

                autoComplete="email"

                placeholder="example@email.com"

                disabled={
                  loading
                }

                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition placeholder:text-slate-600 focus:border-emerald-500 disabled:opacity-50"
              />

            </div>


            {/* Message */}

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


            {/* Send */}

            <button
              type="button"

              onClick={
                handleSendResetEmail
              }

              disabled={
                loading ||
                !email
              }

              className="w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {loading
                ? "送信中..."
                : "再設定メールを送信"}

            </button>


            {/* Back */}

            <Link
              href="/login"

              className="flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              ログイン画面へ戻る
            </Link>

          </div>


          {/* ==================================================
              注意
          ================================================== */}

          <div className="mt-8 rounded-xl bg-slate-950 p-4">

            <p className="text-xs leading-relaxed text-slate-500">
              メールが届かない場合は、迷惑メールフォルダをご確認ください。
              また、登録時とは異なるメールアドレスを入力していないかご確認ください。
            </p>

          </div>


          {/* ==================================================
              Footer
          ================================================== */}

          <div className="mt-8 border-t border-slate-800 pt-5">

            <p className="text-center text-xs leading-relaxed text-slate-500">
              VRC Live MarketはVRChat Inc.の公式サービスではありません。
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}