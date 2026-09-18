"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateMarketPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [loading, setLoading] = useState(false);

  // GEM-1234 のようなMarket IDを作る
  function generateMarketId() {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `GEM-${random}`;
  }

  // 「販売会を作成」を押した時の処理
  async function handleCreate() {
    // 未入力チェック
    if (!title.trim()) {
      alert("販売会名を入力してください。");
      return;
    }

    if (!sellerName.trim()) {
      alert("VRChat表示名を入力してください。");
      return;
    }

    setLoading(true);

    // 現在ログインしているユーザーを取得
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // ログインしていなければログイン画面へ
    if (userError || !user) {
      alert("ログインしてください。");
      setLoading(false);
      router.push("/login");
      return;
    }

    // Market IDを自動生成
    const marketId = generateMarketId();

    // Supabaseのmarketsテーブルへ保存
    const { data, error } = await supabase
      .from("markets")
      .insert({
        user_id: user.id,
        market_id: marketId,
        title: title.trim(),
        seller_display_names: [sellerName.trim()],
        status: "draft",
      })
      .select()
      .single();

    // 保存失敗
    if (error) {
      console.error(error);
      alert("販売会の作成に失敗しました：" + error.message);
      setLoading(false);
      return;
    }

    // 保存成功
    alert(`販売会を作成しました\nMarket ID：${marketId}`);

    // この販売会の編集ページへ移動
    router.push(`/markets/${data.id}`);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* 一覧へ戻る */}
        <button
          onClick={() => router.push("/")}
          className="mb-8 text-sm text-slate-400 transition hover:text-white"
        >
          ← 販売会一覧へ戻る
        </button>

        {/* タイトル */}
        <div className="mb-10">
          <p className="text-sm font-semibold tracking-[0.25em] text-emerald-400">
            UruBooth
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            新しい販売会を作成
          </h1>

          <p className="mt-3 text-slate-400">
            VRChatで使用する販売会の基本情報を入力してください。
          </p>
        </div>

        {/* 入力フォーム */}
        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              販売会名
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：9月 鉱物放出会"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              VRChat表示名
            </label>

            <input
              type="text"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              placeholder="例：もちもちわらびもち"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
            />

            <p className="mt-2 text-sm text-slate-500">
              VRChat内で販売者として操作できる表示名です。
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">
              Market ID
            </p>

            <p className="mt-1 font-mono text-lg font-semibold text-emerald-400">
              作成時に自動生成されます
            </p>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "作成中..." : "販売会を作成"}
          </button>
        </div>
      </div>
    </main>
  );
}