"use client";

import {
  KeyboardEvent,
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { createClient } from "@/lib/supabase/client";


// ============================================================
// 型
// ============================================================

type Market = {
  id: string;

  market_id: string;

  title: string;

  seller_display_names: string[];

  staff_display_names: string[];

  stream_url: string;

  status: string;

  runtime_slot: number | null;
};


type Product = {
  id: string;

  name: string;

  price: number;

  description: string;

  initial_state: string;

  sort_order: number;
};


type PublishResponse = {
  success?: boolean;

  marketId?: string;

  runtimeSlot?: number;

  productCount?: number;

  imageCount?: number;

  operatorCount?: number;

  message?: string;

  error?: string;
};


// ============================================================
// ページ
// ============================================================

export default function MarketEditPage() {
  const params = useParams();

  const router = useRouter();


  const [supabase] =
    useState(() => createClient());


  const marketUuid =
    params.id as string;


  // ==========================================================
  // データ
  // ==========================================================

  const [market, setMarket] =
    useState<Market | null>(null);


  const [products, setProducts] =
    useState<Product[]>([]);


  // ==========================================================
  // 販売会入力
  // ==========================================================

  const [title, setTitle] =
    useState("");


  const [sellerName, setSellerName] =
    useState("");


  // ==========================================================
  // スタッフ
  // ==========================================================

  const [staffNames, setStaffNames] =
    useState<string[]>([]);


  const [newStaffName, setNewStaffName] =
    useState("");


  // ==========================================================
  // 配信URL
  // ==========================================================

  const [streamUrl, setStreamUrl] =
    useState("");


  // ==========================================================
  // 状態
  // ==========================================================

  const [loading, setLoading] =
    useState(true);


  const [saving, setSaving] =
    useState(false);


  const [publishing, setPublishing] =
    useState(false);


  // ==========================================================
  // 販売会＋商品を読み込む
  // ==========================================================

  async function loadMarketData() {
    setLoading(true);


    // --------------------------------------------------------
    // 販売会
    // --------------------------------------------------------

    const {
      data: marketData,
      error: marketError,
    } =
      await supabase
        .from("markets")
        .select("*")
        .eq("id", marketUuid)
        .single();


    if (marketError) {
      console.error(
        "Market load error:",
        marketError
      );


      alert(
        "販売会を読み込めませんでした：" +
          marketError.message
      );


      setLoading(false);

      return;
    }


    setMarket(
      marketData as Market
    );


    setTitle(
      marketData.title
    );


    setSellerName(
      marketData
        .seller_display_names?.[0] ??
        ""
    );


    setStaffNames(
      marketData.staff_display_names ??
        []
    );


    setStreamUrl(
      marketData.stream_url ??
        ""
    );


    // --------------------------------------------------------
    // 商品一覧
    // --------------------------------------------------------

    const {
      data: productData,
      error: productError,
    } =
      await supabase
        .from("products")
        .select("*")
        .eq(
          "market_id",
          marketUuid
        )
        .order(
          "sort_order",
          {
            ascending: true,
          }
        );


    if (productError) {
      console.error(
        "Product load error:",
        productError
      );


      alert(
        "商品を読み込めませんでした：" +
          productError.message
      );


      setProducts([]);
    } else {
      setProducts(
        productData ?? []
      );
    }


    setLoading(false);
  }


  // ==========================================================
  // 初回読み込み
  // ==========================================================

  useEffect(() => {
    loadMarketData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketUuid]);


  // ==========================================================
  // スタッフ追加
  // ==========================================================

  function handleAddStaff() {
    const trimmedName =
      newStaffName.trim();


    if (!trimmedName) {
      alert(
        "スタッフのVRChat表示名を入力してください。"
      );

      return;
    }


    // --------------------------------------------------------
    // 販売者本人と同じ名前は登録しない
    // --------------------------------------------------------

    if (
      trimmedName.toLowerCase() ===
      sellerName
        .trim()
        .toLowerCase()
    ) {
      alert(
        "販売者本人はスタッフとして追加する必要はありません。"
      );

      return;
    }


    // --------------------------------------------------------
    // 重複確認
    // --------------------------------------------------------

    const alreadyExists =
      staffNames.some(
        (staffName) =>
          staffName
            .trim()
            .toLowerCase() ===
          trimmedName.toLowerCase()
      );


    if (alreadyExists) {
      alert(
        "このスタッフはすでに登録されています。"
      );

      return;
    }


    setStaffNames(
      (current) => [
        ...current,
        trimmedName,
      ]
    );


    setNewStaffName("");
  }


  // ==========================================================
  // Enterでもスタッフ追加
  // ==========================================================

  function handleStaffKeyDown(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key === "Enter"
    ) {
      event.preventDefault();

      handleAddStaff();
    }
  }


  // ==========================================================
  // スタッフ削除
  // ==========================================================

  function handleRemoveStaff(
    index: number
  ) {
    setStaffNames(
      (current) =>
        current.filter(
          (_, currentIndex) =>
            currentIndex !== index
        )
    );
  }


  // ==========================================================
  // 配信URLの簡易チェック
  // ==========================================================

  function isValidStreamUrl(
    value: string
  ) {
    // 空欄は「配信なし」として許可
    if (!value) {
      return true;
    }


    try {
      const parsedUrl =
        new URL(value);


      return (
        parsedUrl.protocol ===
          "https:" ||
        parsedUrl.protocol ===
          "http:"
      );
    } catch {
      return false;
    }
  }


  // ==========================================================
  // 販売会情報保存
  // ==========================================================

  async function handleSave() {
    if (!title.trim()) {
      alert(
        "販売会名を入力してください。"
      );

      return;
    }


    if (!sellerName.trim()) {
      alert(
        "VRChat販売者名を入力してください。"
      );

      return;
    }


    const cleanedStreamUrl =
      streamUrl.trim();


    if (
      !isValidStreamUrl(
        cleanedStreamUrl
      )
    ) {
      alert(
        "配信URLの形式を確認してください。\n例：https://www.youtube.com/watch?v=..."
      );

      return;
    }


    // --------------------------------------------------------
    // スタッフ名整理
    // --------------------------------------------------------

    const cleanedStaffNames =
      staffNames
        .map(
          (name) =>
            name.trim()
        )
        .filter(
          (name) =>
            name.length > 0
        );


    setSaving(true);


    const { error } =
      await supabase
        .from("markets")
        .update({
          title:
            title.trim(),

          seller_display_names: [
            sellerName.trim(),
          ],

          staff_display_names:
            cleanedStaffNames,

          stream_url:
            cleanedStreamUrl,

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          marketUuid
        );


    if (error) {
      console.error(
        "Market save error:",
        error
      );


      alert(
        "保存に失敗しました：" +
          error.message
      );


      setSaving(false);

      return;
    }


    setStaffNames(
      cleanedStaffNames
    );


    setStreamUrl(
      cleanedStreamUrl
    );


    setMarket(
      (current) => {
        if (!current) {
          return current;
        }


        return {
          ...current,

          title:
            title.trim(),

          seller_display_names: [
            sellerName.trim(),
          ],

          staff_display_names:
            cleanedStaffNames,

          stream_url:
            cleanedStreamUrl,
        };
      }
    );


    alert(
      "販売会情報を保存しました。"
    );


    setSaving(false);
  }


  // ==========================================================
  // 販売会公開
  // ==========================================================

  async function handlePublish() {
    if (!market) {
      return;
    }


    if (
      products.length === 0
    ) {
      alert(
        "商品が1件もありません。商品を追加してから公開してください。"
      );

      return;
    }


    const confirmed =
      window.confirm(
        market.status ===
          "published"
          ? "販売会を再公開しますか？\n現在の公開内容が最新の内容に更新されます。"
          : "この販売会を公開しますか？\n公開後、VRChatから読み込めるようになります。"
      );


    if (!confirmed) {
      return;
    }


    setPublishing(true);


    try {
      // ------------------------------------------------------
      // ログインSession
      // ------------------------------------------------------

      const {
        data: sessionData,
        error: sessionError,
      } =
        await supabase.auth
          .getSession();


      if (
        sessionError ||
        !sessionData.session
      ) {
        alert(
          "ログイン情報を取得できませんでした。もう一度ログインしてください。"
        );


        setPublishing(false);

        return;
      }


      const accessToken =
        sessionData.session
          .access_token;


      // ------------------------------------------------------
      // 公開API
      // ------------------------------------------------------

      const response =
        await fetch(
          `/api/markets/${marketUuid}/publish`,
          {
            method:
              "POST",

            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          }
        );


      const result =
        (await response.json()) as PublishResponse;


      // ------------------------------------------------------
      // 失敗
      // ------------------------------------------------------

      if (!response.ok) {
        alert(
          "公開に失敗しました：\n" +
            (
              result.error ??
              "不明なエラーが発生しました。"
            )
        );


        return;
      }


      // ------------------------------------------------------
      // 成功
      // ------------------------------------------------------

      alert(
        [
          result.message ??
            "販売会を公開しました。",

          "",

          `Market ID：${
            result.marketId ??
            market.market_id
          }`,

          `Runtime Slot：${
            result.runtimeSlot ??
            "-"
          }`,

          `商品数：${
            result.productCount ??
            products.length
          }`,

          `画像数：${
            result.imageCount ??
            "-"
          }`,

          `操作権限人数：${
            result.operatorCount ??
            "-"
          }`,
        ].join("\n")
      );


      await loadMarketData();

    } catch (error) {
      console.error(
        "Publish request error:",
        error
      );


      alert(
        "公開処理中に通信エラーが発生しました。"
      );
    } finally {
      setPublishing(false);
    }
  }


  // ==========================================================
  // 読み込み中
  // ==========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">

        <div className="mx-auto max-w-5xl px-6 py-10">
          読み込み中...
        </div>

      </main>
    );
  }


  // ==========================================================
  // 販売会なし
  // ==========================================================

  if (!market) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">

        <div className="mx-auto max-w-5xl px-6 py-10">
          販売会が見つかりません。
        </div>

      </main>
    );
  }


  // ==========================================================
  // 画面
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* ====================================================
            戻る
        ==================================================== */}

        <button
          onClick={() =>
            router.push("/")
          }
          className="mb-8 text-sm text-slate-400 transition hover:text-white"
        >
          ← 販売会一覧へ戻る
        </button>


        {/* ====================================================
            タイトル
        ==================================================== */}

        <div className="mb-10">

          <p className="text-sm font-semibold tracking-[0.25em] text-emerald-400">
            VRC LIVE MARKET
          </p>


          <h1 className="mt-3 text-4xl font-bold">
            販売会を編集
          </h1>

        </div>


        {/* ====================================================
            上部
        ==================================================== */}

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">


          {/* ==================================================
              左：設定
          ================================================== */}

          <section className="space-y-7 rounded-2xl border border-slate-800 bg-slate-900 p-8">


            {/* 販売会名 */}
            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                販売会名
              </label>


              <input
                value={title}

                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }

                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
              />

            </div>


            {/* ================================================
                販売者
            ================================================ */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                VRChat販売者名
              </label>


              <input
                value={
                  sellerName
                }

                onChange={(e) =>
                  setSellerName(
                    e.target.value
                  )
                }

                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
              />


              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                販売会を主催する人のVRChat Display Nameです。
              </p>

            </div>


            {/* ================================================
                スタッフ
            ================================================ */}

            <div className="border-t border-slate-800 pt-7">

              <div className="mb-4">

                <h2 className="text-lg font-bold">
                  スタッフ
                </h2>


                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  販売を手伝うスタッフのVRChat Display Nameを登録します。
                </p>


                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  登録されたスタッフも、VRChat内で販売者用パネルを操作できます。
                </p>

              </div>


              {staffNames.length === 0 ? (

                <div className="mb-4 rounded-xl border border-dashed border-slate-700 px-4 py-5 text-center text-sm text-slate-500">
                  スタッフはまだ登録されていません。
                </div>

              ) : (

                <div className="mb-4 space-y-2">

                  {staffNames.map(
                    (
                      staffName,
                      index
                    ) => (

                      <div
                        key={`${staffName}-${index}`}
                        className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-3"
                      >

                        <div className="min-w-0 flex-1">

                          <p className="truncate font-medium">
                            {staffName}
                          </p>


                          <p className="mt-1 text-xs text-slate-500">
                            スタッフ
                          </p>

                        </div>


                        <button
                          type="button"

                          onClick={() =>
                            handleRemoveStaff(
                              index
                            )
                          }

                          className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-400 transition hover:bg-red-950"
                        >
                          削除
                        </button>

                      </div>

                    )
                  )}

                </div>

              )}


              <div className="flex flex-col gap-2 sm:flex-row">

                <input
                  type="text"

                  value={
                    newStaffName
                  }

                  onChange={(e) =>
                    setNewStaffName(
                      e.target.value
                    )
                  }

                  onKeyDown={
                    handleStaffKeyDown
                  }

                  placeholder="VRChat表示名を入力"

                  className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                />


                <button
                  type="button"

                  onClick={
                    handleAddStaff
                  }

                  className="shrink-0 rounded-xl border border-emerald-700 px-5 py-3 font-semibold text-emerald-400 transition hover:bg-emerald-950"
                >
                  ＋ 追加
                </button>

              </div>

            </div>


            {/* ================================================
                ライブ配信
            ================================================ */}

            <div className="border-t border-slate-800 pt-7">

              <div className="mb-4">

                <h2 className="text-lg font-bold">
                  ライブ配信
                </h2>


                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  VRChatワールドに入ったときに自動再生する配信URLを設定します。
                </p>

              </div>


              <label className="mb-2 block text-sm font-medium text-slate-300">
                配信URL
              </label>


              <input
                type="url"

                value={
                  streamUrl
                }

                onChange={(e) =>
                  setStreamUrl(
                    e.target.value
                  )
                }

                placeholder="https://www.youtube.com/watch?v=..."

                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-blue-500"
              />


              <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-4">

                <p className="text-sm font-medium text-slate-300">
                  対応予定
                </p>


                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  YouTube Live / Twitch など、VRChatのAVPro Video Playerで再生できるURLを設定できます。
                </p>

              </div>


              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                空欄にすると自動再生しません。VRChat内で販売者・スタッフが一時的に別URLへ変更することもできるようにします。その変更はWebには保存されません。
              </p>

            </div>


            {/* ================================================
                保存
            ================================================ */}

            <button
              onClick={
                handleSave
              }

              disabled={
                saving
              }

              className="w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {saving
                ? "保存中..."
                : "変更を保存"}

            </button>

          </section>


          {/* ==================================================
              右：公開情報
          ================================================== */}

          <aside className="h-fit space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">


            {/* Market ID */}
            <div>

              <p className="text-sm text-slate-400">
                Market ID
              </p>


              <p className="mt-1 font-mono text-xl font-bold text-emerald-400">
                {market.market_id}
              </p>

            </div>


            <div className="border-t border-slate-800" />


            {/* 公開状態 */}
            <div>

              <p className="text-sm text-slate-400">
                公開状態
              </p>


              <div className="mt-2 flex items-center gap-2">

                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    market.status ===
                    "published"
                      ? "bg-emerald-400"
                      : "bg-slate-500"
                  }`}
                />


                <p className="font-semibold">

                  {market.status ===
                  "published"
                    ? "公開中"
                    : "下書き"}

                </p>

              </div>

            </div>


            {/* Runtime Slot */}
            {market.runtime_slot !==
              null && (
              <>
                <div className="border-t border-slate-800" />


                <div>

                  <p className="text-sm text-slate-400">
                    Runtime Slot
                  </p>


                  <p className="mt-1 font-mono font-semibold">
                    {String(
                      market.runtime_slot
                    ).padStart(
                      2,
                      "0"
                    )}
                  </p>

                </div>
              </>
            )}


            <div className="border-t border-slate-800" />


            {/* 権限概要 */}
            <div>

              <p className="text-sm text-slate-400">
                VRChat操作権限
              </p>


              <p className="mt-2 text-sm">
                販売者 1名
              </p>


              <p className="mt-1 text-sm">
                スタッフ{" "}
                {staffNames.length}名
              </p>

            </div>


            <div className="border-t border-slate-800" />


            {/* 配信設定概要 */}
            <div>

              <p className="text-sm text-slate-400">
                ライブ配信
              </p>


              {streamUrl.trim() ? (

                <>
                  <p className="mt-2 font-semibold text-blue-400">
                    URL設定あり
                  </p>


                  <p className="mt-2 break-all text-xs leading-relaxed text-slate-500">
                    {streamUrl}
                  </p>
                </>

              ) : (

                <p className="mt-2 text-sm text-slate-500">
                  配信URL未設定
                </p>

              )}

            </div>


            <div className="border-t border-slate-800" />


            <p className="text-sm leading-relaxed text-slate-400">

              {market.status ===
              "published"
                ? "変更した商品・スタッフ・配信設定をVRChatへ反映するには、保存後に再公開してください。"
                : "準備が完了したらVRChat向けに公開できます。"}

            </p>


            {/* 公開ボタン */}
            <button
              onClick={
                handlePublish
              }

              disabled={
                publishing ||
                products.length === 0
              }

              className="w-full rounded-xl bg-blue-500 px-5 py-3 font-bold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
            >

              {publishing
                ? "公開処理中..."
                : market.status ===
                    "published"
                  ? "↻ 再公開する"
                  : "🚀 販売会を公開"}

            </button>


            {products.length ===
              0 && (
              <p className="text-center text-xs text-slate-500">
                商品を1件以上追加すると公開できます。
              </p>
            )}

          </aside>

        </div>


        {/* ====================================================
            商品
        ==================================================== */}

        <section className="mt-10">

          <div className="mb-5 flex items-center justify-between gap-6">

            <div>

              <h2 className="text-2xl font-bold">
                商品
              </h2>


              <p className="mt-1 text-sm text-slate-400">
                この販売会で紹介する商品を管理します。
              </p>

            </div>


            <button
              onClick={() =>
                router.push(
                  `/markets/${marketUuid}/products/new`
                )
              }

              className="shrink-0 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              ＋ 商品を追加
            </button>

          </div>


          {products.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-500">
              まだ商品がありません。
            </div>

          ) : (

            <div className="space-y-4">

              {products.map(
                (
                  product,
                  index
                ) => (

                  <div
                    key={
                      product.id
                    }

                    className="flex items-center justify-between gap-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"
                  >

                    <div>

                      <p className="text-sm text-slate-500">
                        No.
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </p>


                      <h3 className="mt-1 text-xl font-bold">
                        {product.name}
                      </h3>


                      <p className="mt-2 text-lg font-semibold text-emerald-400">
                        ¥
                        {product.price.toLocaleString()}
                      </p>


                      {product.description && (
                        <p className="mt-2 text-sm text-slate-400">
                          {product.description}
                        </p>
                      )}

                    </div>


                    <div className="flex flex-col items-end gap-3">

                      <span className="rounded-full border border-slate-700 px-3 py-1 text-sm">
                        {product.initial_state}
                      </span>


                      <button
                        onClick={() =>
                          router.push(
                            `/markets/${marketUuid}/products/${product.id}`
                          )
                        }

                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium transition hover:bg-slate-800"
                      >
                        編集
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}