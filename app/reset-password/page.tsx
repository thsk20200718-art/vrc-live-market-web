"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0Z" />
      <circle cx="12" cy="12" r="3" />
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
    >
      <path d="m3 3 18 18" />
      <path d="M10.584 10.587a2 2 0 0 0 2.829 2.828" />
      <path d="M9.363 5.365A10.59 10.59 0 0 1 12 5c5.05 0 9.27 3.11 10 7-.21 1.12-.73 2.17-1.5 3.08" />
      <path d="M6.71 6.709C4.68 8.07 3.27 9.94 3 12c.73 3.89 4.95 7 10 7 1.68 0 3.27-.35 4.71-.98" />
    </svg>
  );
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const [canReset, setCanReset] = useState(false);

  useEffect(() => {
    async function checkRecoverySession() {
      try {
        const supabase = createClient();

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(error);
          setMessage("セッションの確認に失敗しました。再度メールから開き直してください。");
          setSuccess(false);
          setCheckingSession(false);
          return;
        }

        if (session) {
          setCanReset(true);
          setCheckingSession(false);
          return;
        }

        setMessage("再設定リンクが無効か期限切れです。もう一度最初からやり直してください。");
        setSuccess(false);
        setCheckingSession(false);
      } catch (error) {
        console.error(error);
        setMessage("セッション確認中にエラーが発生しました。");
        setSuccess(false);
        setCheckingSession(false);
      }
    }

    checkRecoverySession();
  }, []);

  async function handleResetPassword() {
    if (loading) return;

    if (!password || !confirmPassword) {
      setMessage("新しいパスワードと確認用パスワードを入力してください。");
      setSuccess(false);
      return;
    }

    if (password.length < 6) {
      setMessage("パスワードは6文字以上で入力してください。");
      setSuccess(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("確認用パスワードが一致していません。");
      setSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      setMessage("パスワードを更新しました。ログイン画面からログインしてください。");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Reset password error:", error);
      setSuccess(false);
      setMessage("パスワードの更新に失敗しました。再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  const passwordsMatched =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-8 sm:px-6 sm:py-10">
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <p className="text-sm font-semibold tracking-[0.25em] text-emerald-400">
            VRC LIVE MARKET
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            新しいパスワードを設定
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            新しいパスワードを入力してください。
          </p>

          {checkingSession && (
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
              セッションを確認しています...
            </div>
          )}

          {!checkingSession && message && (
            <div
              className={
                success
                  ? "mt-6 rounded-xl border border-emerald-900 bg-emerald-950/30 p-4 text-sm leading-relaxed text-emerald-300"
                  : "mt-6 rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm leading-relaxed text-red-300"
              }
            >
              {message}
            </div>
          )}

          {!checkingSession && canReset && (
            <div className="mt-8 space-y-5">
              {/* 新しいパスワード */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  新しいパスワード
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="6文字以上で入力"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 outline-none transition placeholder:text-slate-600 focus:border-emerald-500 disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                    aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* 確認用パスワード */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  新しいパスワード（確認）
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="もう一度入力"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 outline-none transition placeholder:text-slate-600 focus:border-emerald-500 disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                    aria-label={
                      showConfirmPassword
                        ? "確認用パスワードを隠す"
                        : "確認用パスワードを表示"
                    }
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* 一致表示 */}
              {password.length > 0 && confirmPassword.length > 0 && (
                <div
                  className={
                    passwordsMatched
                      ? "rounded-xl border border-emerald-900 bg-emerald-950/30 p-3 text-sm text-emerald-300"
                      : "rounded-xl border border-amber-900 bg-amber-950/30 p-3 text-sm text-amber-300"
                  }
                >
                  {passwordsMatched
                    ? "✓ パスワードが一致しています。"
                    : "確認用パスワードが一致していません。"}
                </div>
              )}

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "変更中..." : "パスワードを変更"}
              </button>
            </div>
          )}

          <div className="mt-8 border-t border-slate-800 pt-5">
            <Link
              href="/login"
              className="flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              ログイン画面へ戻る
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}