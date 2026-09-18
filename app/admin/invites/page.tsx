"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createClient,
} from "@/lib/supabase/client";


// ============================================================
// 型
// ============================================================

type Invite = {
  id: string;
  code: string;
  label: string | null;
  is_active: boolean;
  max_uses: number;
  use_count: number;
  expires_at: string | null;
  created_at: string;
  updated_at?: string;
};


type InviteUse = {
  id: string;
  invite_code_id: string;
  user_id: string;
  used_at: string;
  email: string | null;
};


// ============================================================
// 定数
// ============================================================

const MAX_EXPIRATION_LOCAL =
  "2035-12-31T23:59";


// ============================================================
// 日付表示
// ============================================================

function formatDate(
  value: string | null
) {
  if (
    !value
  ) {
    return "なし";
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "不明";
  }


  return date.toLocaleString(
    "ja-JP",
    {
      year:
        "numeric",

      month:
        "2-digit",

      day:
        "2-digit",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  );
}


// ============================================================
// 招待コード状態判定
// ============================================================

function isExpired(
  invite: Invite
) {
  if (
    !invite.expires_at
  ) {
    return false;
  }


  const date =
    new Date(
      invite.expires_at
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return true;
  }


  return (
    date.getTime() <=
    Date.now()
  );
}


function isUsableInvite(
  invite: Invite
) {
  return (
    invite.is_active &&
    !isExpired(
      invite
    ) &&
    invite.use_count <
      invite.max_uses
  );
}


// ============================================================
// ページ
// ============================================================

export default function AdminInvitesPage() {
  const [
    invites,
    setInvites,
  ] =
    useState<
      Invite[]
    >([]);


  const [
    uses,
    setUses,
  ] =
    useState<
      InviteUse[]
    >([]);


  const [
    label,
    setLabel,
  ] =
    useState("");


  const [
    maxUses,
    setMaxUses,
  ] =
    useState(1);


  const [
    expiresAt,
    setExpiresAt,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    creating,
    setCreating,
  ] =
    useState(false);


  const [
    updatingId,
    setUpdatingId,
  ] =
    useState<
      string | null
    >(null);


  const [
    deletingId,
    setDeletingId,
  ] =
    useState<
      string | null
    >(null);


  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");


  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState("");


  // ==========================================================
  // 統計
  // ==========================================================

  const stats =
    useMemo(
      () => {

        const issuedCount =
          invites.length;


        const usableCount =
          invites.filter(
            isUsableInvite
          ).length;


        const uniqueUsers =
          new Set(
            uses.map(
              (
                usage
              ) =>
                usage.user_id
            )
          );


        return {
          issuedCount,

          usableCount,

          registeredUsers:
            uniqueUsers.size,

          totalUses:
            uses.length,
        };
      },
      [
        invites,
        uses,
      ]
    );


  // ==========================================================
  // 初回読み込み
  // ==========================================================

  useEffect(() => {
    loadInvites();
  }, []);


  // ==========================================================
  // Access Token
  // ==========================================================

  async function getAccessToken() {
    const supabase =
      createClient();


    const {
      data: {
        session,
      },

      error,
    } =
      await supabase
        .auth
        .getSession();


    if (
      error ||
      !session
    ) {
      throw new Error(
        "ログイン情報を確認できませんでした。"
      );
    }


    return session
      .access_token;
  }


  // ==========================================================
  // 一覧取得
  // ==========================================================

  async function loadInvites() {
    setLoading(
      true
    );

    setErrorMessage(
      ""
    );


    try {
      const accessToken =
        await getAccessToken();


      const response =
        await fetch(
          "/api/admin/invites",
          {
            method:
              "GET",

            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },

            cache:
              "no-store",
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
          "招待コードを取得できませんでした。"
        );
      }


      setInvites(
        result.invites ??
        []
      );


      setUses(
        result.uses ??
        []
      );

    } catch (
      error
    ) {
      console.error(
        "Invite load error:",
        error
      );


      setErrorMessage(
        error instanceof
          Error
          ? error.message
          : "招待コードの取得に失敗しました。"
      );

    } finally {
      setLoading(
        false
      );
    }
  }


  // ==========================================================
  // 入力チェック
  // ==========================================================

  function validateInviteInput() {
    if (
      label.length >
      100
    ) {
      return "ラベルは100文字以内で入力してください。";
    }


    if (
      !Number.isFinite(
        maxUses
      ) ||
      maxUses <
        1 ||
      maxUses >
        100
    ) {
      return "利用上限は1〜100回で設定してください。";
    }


    if (
      !expiresAt
    ) {
      return null;
    }


    const expirationDate =
      new Date(
        expiresAt
      );


    if (
      Number.isNaN(
        expirationDate.getTime()
      )
    ) {
      return "有効期限が正しくありません。";
    }


    if (
      expirationDate.getTime() <=
      Date.now()
    ) {
      return "有効期限は現在より後の日時を指定してください。";
    }


    const maxDate =
      new Date(
        MAX_EXPIRATION_LOCAL
      );


    if (
      expirationDate.getTime() >
      maxDate.getTime()
    ) {
      return "有効期限は2035年12月31日までで設定してください。";
    }


    return null;
  }


  // ==========================================================
  // 招待コード発行
  // ==========================================================

  async function createInvite() {
    if (
      creating
    ) {
      return;
    }


    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );


    const validationError =
      validateInviteInput();


    if (
      validationError
    ) {
      setErrorMessage(
        validationError
      );

      return;
    }


    setCreating(
      true
    );


    try {
      const accessToken =
        await getAccessToken();


      let expiresAtIso:
        string | null =
        null;


      if (
        expiresAt
      ) {
        expiresAtIso =
          new Date(
            expiresAt
          ).toISOString();
      }


      const response =
        await fetch(
          "/api/admin/invites",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${accessToken}`,
            },

            body:
              JSON.stringify({
                label:
                  label.trim(),

                maxUses:
                  Number(
                    maxUses
                  ),

                expiresAt:
                  expiresAtIso,
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
          "招待コードの発行に失敗しました。"
        );
      }


      setSuccessMessage(
        `招待コードを発行しました：${result.invite.code}`
      );


      setLabel(
        ""
      );

      setMaxUses(
        1
      );

      setExpiresAt(
        ""
      );


      await loadInvites();

    } catch (
      error
    ) {
      console.error(
        "Invite create error:",
        error
      );


      setErrorMessage(
        error instanceof
          Error
          ? error.message
          : "招待コードの発行に失敗しました。"
      );

    } finally {
      setCreating(
        false
      );
    }
  }


  // ==========================================================
  // 有効・無効切り替え
  // ==========================================================

  async function toggleInvite(
    invite: Invite
  ) {
    if (
      updatingId ||
      deletingId
    ) {
      return;
    }


    setUpdatingId(
      invite.id
    );

    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );


    try {
      const accessToken =
        await getAccessToken();


      const response =
        await fetch(
          `/api/admin/invites/${invite.id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${accessToken}`,
            },

            body:
              JSON.stringify({
                isActive:
                  !invite.is_active,
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
          "状態変更に失敗しました。"
        );
      }


      setSuccessMessage(
        !invite.is_active
          ? "招待コードを有効化しました。"
          : "招待コードを無効化しました。"
      );


      await loadInvites();

    } catch (
      error
    ) {
      console.error(
        "Invite toggle error:",
        error
      );


      setErrorMessage(
        error instanceof
          Error
          ? error.message
          : "招待コードの状態変更に失敗しました。"
      );

    } finally {
      setUpdatingId(
        null
      );
    }
  }


  // ==========================================================
  // 削除
  // ==========================================================

  async function deleteInvite(
    invite: Invite
  ) {
    if (
      deletingId ||
      updatingId
    ) {
      return;
    }


    if (
      invite.use_count >
      0
    ) {
      setErrorMessage(
        "使用済みの招待コードは削除できません。無効化してください。"
      );

      return;
    }


    const confirmed =
      window.confirm(
        `招待コード「${invite.code}」を削除しますか？\n\nこの操作は元に戻せません。`
      );


    if (
      !confirmed
    ) {
      return;
    }


    setDeletingId(
      invite.id
    );

    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );


    try {
      const accessToken =
        await getAccessToken();


      const response =
        await fetch(
          `/api/admin/invites/${invite.id}`,
          {
            method:
              "DELETE",

            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
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
          "招待コードを削除できませんでした。"
        );
      }


      setSuccessMessage(
        "招待コードを削除しました。"
      );


      await loadInvites();

    } catch (
      error
    ) {
      console.error(
        "Invite delete error:",
        error
      );


      setErrorMessage(
        error instanceof
          Error
          ? error.message
          : "招待コードの削除に失敗しました。"
      );

    } finally {
      setDeletingId(
        null
      );
    }
  }


  // ==========================================================
  // コピー
  // ==========================================================

  async function copyInviteCode(
    code: string
  ) {
    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );


    try {
      await navigator
        .clipboard
        .writeText(
          code
        );


      setSuccessMessage(
        `コピーしました：${code}`
      );

    } catch {
      setErrorMessage(
        "クリップボードへのコピーに失敗しました。"
      );
    }
  }


  // ==========================================================
  // 招待コード名
  // ==========================================================

  function getInviteCodeById(
    inviteId: string
  ) {
    return (
      invites.find(
        (
          invite
        ) =>
          invite.id ===
          inviteId
      )?.code ??
      "不明"
    );
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">


        {/* Header */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <p className="text-sm font-semibold tracking-[0.25em] text-emerald-400">
              UruBooth
            </p>


            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              Closed Beta 管理
            </h1>


            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              招待コードとClosed Beta参加者を管理します。
            </p>

          </div>


          <Link
            href="/"

            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            ← 販売会管理へ戻る
          </Link>

        </div>


        {/* Messages */}

        {errorMessage && (

          <div className="mt-8 rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
            {errorMessage}
          </div>

        )}


        {successMessage && (

          <div className="mt-8 rounded-xl border border-emerald-900 bg-emerald-950/30 p-4 text-sm text-emerald-300">
            {successMessage}
          </div>

        )}


        {/* 統計 */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <p className="text-sm text-slate-500">
              発行コード
            </p>

            <p className="mt-2 text-3xl font-bold">
              {stats.issuedCount}
            </p>

          </div>


          <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/20 p-5">

            <p className="text-sm text-emerald-400">
              現在利用可能
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-300">
              {stats.usableCount}
            </p>

          </div>


          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <p className="text-sm text-slate-500">
              登録ユーザー
            </p>

            <p className="mt-2 text-3xl font-bold">
              {stats.registeredUsers}
            </p>

          </div>


          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <p className="text-sm text-slate-500">
              累計使用回数
            </p>

            <p className="mt-2 text-3xl font-bold">
              {stats.totalUses}
            </p>

          </div>

        </section>


        {/* 新規発行 */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">

          <h2 className="text-xl font-bold">
            招待コードを発行
          </h2>


          <div className="mt-6 grid gap-5 md:grid-cols-3">

            <div>

              <label className="mb-2 block text-sm text-slate-300">
                ラベル
              </label>

              <input
                type="text"
                value={label}
                maxLength={100}

                onChange={(event) =>
                  setLabel(
                    event.target.value
                  )
                }

                placeholder="例：○○ショップ"

                disabled={creating}

                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500 disabled:opacity-50"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm text-slate-300">
                利用上限
              </label>

              <input
                type="number"
                min="1"
                max="100"
                value={maxUses}

                onChange={(event) =>
                  setMaxUses(
                    Number(
                      event.target.value
                    )
                  )
                }

                disabled={creating}

                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500 disabled:opacity-50"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm text-slate-300">
                有効期限
              </label>

              <input
                type="datetime-local"
                value={expiresAt}
                max={MAX_EXPIRATION_LOCAL}

                onChange={(event) =>
                  setExpiresAt(
                    event.target.value
                  )
                }

                disabled={creating}

                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500 disabled:opacity-50"
              />

              <p className="mt-2 text-xs text-slate-500">
                空欄なら期限なし
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={createInvite}
            disabled={creating}

            className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {creating
              ? "発行中..."
              : "＋ 招待コードを発行"}
          </button>

        </section>


        {/* 招待コード */}

        <section className="mt-10">

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold">
              招待コード一覧
            </h2>


            <button
              type="button"
              onClick={loadInvites}
              disabled={loading}

              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              更新
            </button>

          </div>


          {loading ? (

            <p className="mt-5 text-slate-400">
              読み込んでいます...
            </p>

          ) : invites.length === 0 ? (

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              招待コードはまだありません。
            </div>

          ) : (

            <div className="mt-5 space-y-4">

              {invites.map(
                (
                  invite
                ) => {

                  const expired =
                    isExpired(
                      invite
                    );

                  const usedUp =
                    invite.use_count >=
                    invite.max_uses;

                  const usable =
                    isUsableInvite(
                      invite
                    );

                  const percentage =
                    Math.min(
                      100,
                      Math.round(
                        (
                          invite.use_count /
                          invite.max_uses
                        ) *
                          100
                      )
                    );


                  return (

                    <article
                      key={invite.id}

                      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6"
                    >

                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">


                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-3">

                            <p className="break-all font-mono text-lg font-bold text-emerald-400">
                              {invite.code}
                            </p>


                            <span
                              className={
                                usable
                                  ? "rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300"
                                  : "rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-300"
                              }
                            >
                              {!invite.is_active
                                ? "無効"
                                : expired
                                  ? "期限切れ"
                                  : usedUp
                                    ? "使用上限"
                                    : "有効"}
                            </span>

                          </div>


                          <p className="mt-3 text-sm text-slate-300">
                            {invite.label ||
                              "ラベルなし"}
                          </p>


                          <div className="mt-4 max-w-md">

                            <div className="flex justify-between text-xs text-slate-500">

                              <span>
                                使用状況
                              </span>

                              <span>
                                {invite.use_count}
                                {" / "}
                                {invite.max_uses}
                                {" ("}
                                {percentage}
                                {"%)"}
                              </span>

                            </div>


                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">

                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all"

                                style={{
                                  width:
                                    `${percentage}%`,
                                }}
                              />

                            </div>

                          </div>


                          <div className="mt-4 space-y-1 text-sm text-slate-500">

                            <p>
                              有効期限：
                              {formatDate(
                                invite.expires_at
                              )}
                            </p>

                            <p>
                              発行：
                              {formatDate(
                                invite.created_at
                              )}
                            </p>

                          </div>

                        </div>


                        <div className="flex flex-col gap-3 sm:flex-row">

                          <button
                            type="button"

                            onClick={() =>
                              copyInviteCode(
                                invite.code
                              )
                            }

                            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold hover:bg-slate-800"
                          >
                            コピー
                          </button>


                          <button
                            type="button"

                            onClick={() =>
                              toggleInvite(
                                invite
                              )
                            }

                            disabled={
                              updatingId ===
                                invite.id ||
                              deletingId ===
                                invite.id
                            }

                            className={
                              invite.is_active
                                ? "rounded-xl border border-amber-900 px-5 py-3 text-sm font-semibold text-amber-300 hover:bg-amber-950/30 disabled:opacity-50"
                                : "rounded-xl border border-emerald-900 px-5 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-950/30 disabled:opacity-50"
                            }
                          >
                            {updatingId ===
                            invite.id
                              ? "変更中..."
                              : invite.is_active
                                ? "無効化"
                                : "有効化"}
                          </button>


                          <button
                            type="button"

                            onClick={() =>
                              deleteInvite(
                                invite
                              )
                            }

                            disabled={
                              invite.use_count >
                                0 ||
                              deletingId ===
                                invite.id ||
                              updatingId ===
                                invite.id
                            }

                            title={
                              invite.use_count >
                              0
                                ? "使用履歴があるため削除できません"
                                : "招待コードを削除"
                            }

                            className="rounded-xl border border-red-900 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            {deletingId ===
                            invite.id
                              ? "削除中..."
                              : "削除"}
                          </button>

                        </div>

                      </div>

                    </article>

                  );
                }
              )}

            </div>

          )}

        </section>


        {/* 使用ユーザー */}

        <section className="mt-12">

          <h2 className="text-xl font-bold">
            Closed Beta 登録ユーザー
          </h2>


          <p className="mt-2 text-sm text-slate-400">
            招待コードを利用して登録したユーザーです。
          </p>


          {uses.length ===
          0 ? (

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              登録ユーザーはまだいません。
            </div>

          ) : (

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[750px] text-left text-sm">

                  <thead className="border-b border-slate-800 bg-slate-950 text-slate-400">

                    <tr>

                      <th className="px-5 py-4 font-medium">
                        メールアドレス
                      </th>

                      <th className="px-5 py-4 font-medium">
                        招待コード
                      </th>

                      <th className="px-5 py-4 font-medium">
                        登録日時
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {uses.map(
                      (
                        usage
                      ) => (

                      <tr
                        key={usage.id}

                        className="border-b border-slate-800 last:border-b-0"
                      >

                        <td className="px-5 py-4 text-slate-300">
                          {usage.email ||
                            "メールアドレス不明"}
                        </td>


                        <td className="px-5 py-4 font-mono text-emerald-400">
                          {getInviteCodeById(
                            usage.invite_code_id
                          )}
                        </td>


                        <td className="px-5 py-4 text-slate-400">
                          {formatDate(
                            usage.used_at
                          )}
                        </td>

                      </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </section>


        <div className="mt-12 border-t border-slate-800 pt-6">

          <p className="text-xs leading-relaxed text-slate-600">
            使用済みの招待コードは履歴保護のため削除できません。
            不要になった場合は無効化してください。
          </p>

        </div>

      </div>

    </main>
  );
}