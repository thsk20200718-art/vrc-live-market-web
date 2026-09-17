"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewProductPage() {
  const params = useParams();
  const router = useRouter();

  const [supabase] = useState(() => createClient());

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [initialState, setInitialState] = useState("AVAILABLE");

  const [loading, setLoading] = useState(false);

  const marketUuid = params.id as string;

  async function handleCreate() {
    if (!name.trim()) {
      alert("商品名を入力してください。");
      return;
    }

    const priceNumber = Number(price);

    if (!Number.isInteger(priceNumber) || priceNumber < 0) {
      alert("価格は0以上の整数で入力してください。");
      return;
    }

    setLoading(true);

    // 現在の商品数を調べる
    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("market_id", marketUuid);

    if (countError) {
      console.error(countError);
      alert("商品数を取得できませんでした：" + countError.message);
      setLoading(false);
      return;
    }

    // productsテーブルへ新しい商品を追加
    const { error } = await supabase
      .from("products")
      .insert({
        market_id: marketUuid,
        sort_order: count ?? 0,
        name: name.trim(),
        price: priceNumber,
        description: description.trim(),
        initial_state: initialState,
      });

    if (error) {
      console.error(error);
      alert("商品の作成に失敗しました：" + error.message);
      setLoading(false);
      return;
    }

    alert("商品を追加しました。");

    // 販売会編集ページへ戻る
    router.push(`/markets/${marketUuid}`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">

        <button
          onClick={() => router.push(`/markets/${marketUuid}`)}
          className="mb-8 text-sm text-slate-400 transition hover:text-white"
        >
          ← 販売会へ戻る
        </button>

        <div className="mb-10">
          <p className="text-sm font-semibold tracking-[0.25em] text-emerald-400">
            VRC LIVE MARKET
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            商品を追加
          </h1>

          <p className="mt-3 text-slate-400">
            VRChatで紹介する商品の情報を入力してください。
          </p>
        </div>

        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              商品名
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：ブラジル産 パイライト"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              価格
            </label>

            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="例：4800"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
            />

            <p className="mt-2 text-sm text-slate-500">
              円単位で入力してください。
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              商品説明
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例：結晶面がきれいなパイライトです。"
              rows={5}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              初期状態
            </label>

            <select
              value={initialState}
              onChange={(e) => setInitialState(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
            >
              <option value="AVAILABLE">
                AVAILABLE - 販売中
              </option>

              <option value="HOLD">
                HOLD - 商談中・取り置き
              </option>

              <option value="SOLD">
                SOLD - 売却済み
              </option>
            </select>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">
              商品写真
            </p>

            <p className="mt-1 text-slate-500">
              写真の登録は次のステップで追加します。
            </p>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "追加中..." : "商品を追加"}
          </button>

        </div>
      </div>
    </main>
  );
}