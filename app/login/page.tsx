"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/client";


// ============================================================
// 型
// ============================================================

type AuthMode =
  | "login"
  | "signup";


// ============================================================
// アイコン
// ============================================================

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696C3.58 7.6 7.46 5 12 5s8.42 2.6 9.938 6.652a1 1 0 0 1 0 .696C20.42 16.4 16.54 19 12 19s-8.42-2.6-9.938-6.652Z" />

      <circle
        cx="12"
        cy="12"
        r="3"
      />
    </svg>
  );
}


function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 3 18 18" />

      <path d="M10.584 10.587a2 2 0 0 0 2.829 2.828" />

      <path d="M9.363 5.365A10.59 10.59 0 0 1 12 5c5.05 0 9.27 3.11 10 7a10.47 10.47 0 0 1-2.5 4.08" />

      <path d="M6.71 6.709C4.68 8.07 3.27 9.94 3 12c.73 3.89 4.95 7 10 7 1.68 0 3.27-.35 4.71-.98" />
    </svg>
  );
}


// ============================================================
// ページ
// ============================================================

export default function LoginPage() {
  const router =
    useRouter();


  const [
    mode,
    setMode,
  ] =
    useState<AuthMode>(
      "login"
    );


  const [
    email,
    setEmail,
  ] =
    useState("");


  const [
    password,
    setPassword,
  ] =
    useState("");


  const [
    inviteCode,
    setInviteCode,
  ] =
    useState("");


  const [
    showPassword,
    setShowPassword,
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


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  // ==========================================================
  // モード変更
  // ==========================================================

  function changeMode(
    nextMode: AuthMode
  ) {
    if (
      loading
    ) {
      return;
    }


    setMode(
      nextMode
    );

    setMessage(
      ""
    );

    setSuccess(
      false
    );

    setPassword(
      ""
    );

    setShowPassword(
      false
    );


    if (
      nextMode ===
      "login"
    ) {
      setInviteCode(
        ""
      );
    }
  }


  // ==========================================================
  // ログイン
  // ==========================================================

  async function signIn() {
    if (
      loading
    ) {
      return;
    }


    if (
      !email ||
      !password
    ) {
      setSuccess(
        false
      );

      setMessage(
        "メールアドレスとパスワードを入力してください。"
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


      const {
        error,
      } =
        await supabase
          .auth
          .signInWithPassword({
            email:
              email
                .trim()
                .toLowerCase(),

            password,
          });


      if (
        error
      ) {
        throw error;
      }


      router.push(
        "/"
      );

      router.refresh();

    } catch (
      error
    ) {
      console.error(
        "Login error:",
        error
      );


      setMessage(
        "メールアドレスまたはパスワードを確認してください。"
      );

    } finally {
      setLoading(
        false
      );
    }
  }


  // ==========================================================
  // 招待コード付き新規登録
  // ==========================================================

  async function signUp() {
    if (
      loading
    ) {
      return;
    }


    if (
      !email ||
      !password ||
      !inviteCode
    ) {
      setSuccess(
        false
      );

      setMessage(
        "メールアドレス、パスワード、招待コードを入力してください。"
      );

      return;
    }


    if (
      password.length <
      6
    ) {
      setSuccess(
        false
      );

      setMessage(
        "パスワードは6文字以上で入力してください。"
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
      const response =
        await fetch(
          "/api/auth/signup",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                email:
                  email
                    .trim()
                    .toLowerCase(),

                password,

                inviteCode:
                  inviteCode
                    .trim()
                    .toUpperCase(),
              }),
          }
        );


      const result =
        await response.json();


      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
          "新規登録に失敗しました。"
        );
      }


      setSuccess(
        true
      );


      setMessage(
        result.message ||
        "アカウントを作成しました。確認メールをご確認ください。"
      );


      setPassword(
        ""
      );

      setInviteCode(
        ""
      );

      setShowPassword(
        false
      );

    } catch (
      error
    ) {
      console.error(
        "Signup error:",
        error
      );


      setSuccess(
        false
      );


      setMessage(
        error instanceof
          Error
          ? error.message
          : "新規登録に失敗しました。"
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
      React.KeyboardEvent
  ) {
    if (
      event.key !==
      "Enter"
    ) {
      return;
    }


    if (
      mode ===
      "login"
    ) {
      signIn();
    } else {
      signUp();
    }
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-8 sm:px-6 sm:py-10">

        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">


          {/* ==================================================
              Header
          ================================================== */}

          <p className="text-sm font-semibold tracking-[0.25em] text-emerald-400">
            VRC LIVE MARKET
          </p>


          <h1 className="mt-3 text-3xl font-bold">

            {mode ===
            "login"
              ? "ログイン"
              : "新規登録"}

          </h1>


          <p className="mt-2 text-sm leading-relaxed text-slate-400">

            {mode ===
            "login"
              ? "販売会を管理するためにログインしてください。"
              : "Closed Betaへの参加には招待コードが必要です。"}

          </p>


          {/* ==================================================
              Login / Signup タブ
          ================================================== */}

          <div className="mt-7 grid grid-cols-2 rounded-xl bg-slate-950 p-1">

            <button
              type="button"

              onClick={() =>
                changeMode(
                  "login"
                )
              }

              disabled={
                loading
              }

              className={
                mode ===
                "login"

                  ? "rounded-lg bg-slate-800 px-4 py-3 text-sm font-semibold text-white"

                  : "rounded-lg px-4 py-3 text-sm font-semibold text-slate-500 transition hover:text-slate-300"
              }
            >
              ログイン
            </button>


            <button
              type="button"

              onClick={() =>
                changeMode(
                  "signup"
                )
              }

              disabled={
                loading
              }

              className={
                mode ===
                "signup"

                  ? "rounded-lg bg-slate-800 px-4 py-3 text-sm font-semibold text-white"

                  : "rounded-lg px-4 py-3 text-sm font-semibold text-slate-500 transition hover:text-slate-300"
              }
            >
              新規登録
            </button>

          </div>


          {/* ==================================================
              Form
          ================================================== */}

          <div
            className="mt-7 space-y-5"

            onKeyDown={
              handleKeyDown
            }
          >


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


            {/* Password */}

            <div>

              <label className="mb-2 block text-sm text-slate-300">
                パスワード
              </label>


              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }

                  value={
                    password
                  }

                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }

                  autoComplete={
                    mode ===
                    "login"
                      ? "current-password"
                      : "new-password"
                  }

                  placeholder={
                    mode ===
                    "signup"
                      ? "6文字以上で入力"
                      : undefined
                  }

                  disabled={
                    loading
                  }

                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 outline-none transition placeholder:text-slate-600 focus:border-emerald-500 disabled:opacity-50"
                />


                <button
                  type="button"

                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }

                  disabled={
                    loading
                  }

                  aria-label={
                    showPassword
                      ? "パスワードを隠す"
                      : "パスワードを表示"
                  }

                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-white disabled:opacity-40"
                >

                  {showPassword
                    ? <EyeOffIcon />
                    : <EyeIcon />}

                </button>

              </div>


              {/* パスワード忘れ */}

              {mode ===
                "login" && (

                <div className="mt-3 text-right">

                  <Link
                    href="/forgot-password"

                    className="text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
                  >
                    パスワードを忘れた方はこちら
                  </Link>

                </div>

              )}

            </div>


            {/* ==================================================
                招待コード
            ================================================== */}

            {mode ===
              "signup" && (

              <div>

                <label className="mb-2 block text-sm text-slate-300">
                  招待コード
                </label>


                <input
                  type="text"

                  value={
                    inviteCode
                  }

                  onChange={(e) =>
                    setInviteCode(
                      e.target
                        .value
                        .toUpperCase()
                    )
                  }

                  autoComplete="off"

                  placeholder="VRC-BETA-XXXX"

                  disabled={
                    loading
                  }

                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono uppercase tracking-wider outline-none transition placeholder:text-slate-600 focus:border-emerald-500 disabled:opacity-50"
                />


                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Closed Beta参加者に発行された招待コードを入力してください。
                </p>

              </div>

            )}


            {/* ==================================================
                Message
            ================================================== */}

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


            {/* ==================================================
                Submit
            ================================================== */}

            {mode ===
            "login" ? (

              <button
                type="button"

                onClick={
                  signIn
                }

                disabled={
                  loading ||
                  !email ||
                  !password
                }

                className="w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading
                  ? "ログイン中..."
                  : "ログイン"}

              </button>

            ) : (

              <button
                type="button"

                onClick={
                  signUp
                }

                disabled={
                  loading ||
                  !email ||
                  !password ||
                  !inviteCode
                }

                className="w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading
                  ? "登録中..."
                  : "招待コードで新規登録"}

              </button>

            )}

          </div>


          {/* ==================================================
              Closed Beta
          ================================================== */}

          {mode ===
            "signup" && (

            <div className="mt-6 rounded-xl border border-amber-900/60 bg-amber-950/20 p-4">

              <p className="text-sm font-semibold text-amber-300">
                Closed Beta
              </p>


              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                現在VRC Live Marketは招待制で提供しています。
                招待コードをお持ちでない場合は新規登録できません。
              </p>

            </div>

          )}


          {/* ==================================================
              Footer
          ================================================== */}

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


              <Link
                href="/guidelines"
                className="text-slate-500 transition hover:text-slate-300"
              >
                利用上の注意
              </Link>

            </div>


            <p className="mt-5 text-center text-xs leading-relaxed text-slate-600">
              VRC Live MarketはVRChat Inc.とは独立して開発されており、
              VRChat Inc.の公式サービスではありません。
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}