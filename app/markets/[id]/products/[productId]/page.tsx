"use client";

import {
  ChangeEvent,
  useCallback,
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

type Product = {
  id: string;
  market_id: string;
  name: string;
  price: number;
  description: string;
  initial_state: string;
  sort_order: number;
};


type ProductImage = {
  id: string;
  product_id: string;
  sort_order: number;
  storage_path: string;
  created_at: string;
  preview_url?: string;
};


// ============================================================
// ページ
// ============================================================

export default function ProductEditPage() {
  const params =
    useParams();

  const router =
    useRouter();

  const [supabase] =
    useState(
      () =>
        createClient()
    );


  const marketUuid =
    params.id as string;

  const productUuid =
    params.productId as string;


  // ============================================================
  // 商品情報
  // ============================================================

  const [
    product,
    setProduct,
  ] =
    useState<Product | null>(
      null
    );


  const [
    name,
    setName,
  ] =
    useState("");


  const [
    price,
    setPrice,
  ] =
    useState("");


  const [
    description,
    setDescription,
  ] =
    useState("");


  const [
    initialState,
    setInitialState,
  ] =
    useState(
      "AVAILABLE"
    );


  // ============================================================
  // 商品画像
  // ============================================================

  const [
    images,
    setImages,
  ] =
    useState<ProductImage[]>(
      []
    );


  // ============================================================
  // 状態
  // ============================================================

  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    saving,
    setSaving,
  ] =
    useState(false);


  const [
    uploading,
    setUploading,
  ] =
    useState(false);


  const [
    deletingImageId,
    setDeletingImageId,
  ] =
    useState<string | null>(
      null
    );


  const [
    movingImageId,
    setMovingImageId,
  ] =
    useState<string | null>(
      null
    );


  // ============================================================
  // 商品画像読み込み
  // ============================================================

  const loadImages =
    useCallback(
      async () => {
        const {
          data:
            imageData,

          error:
            imageError,
        } =
          await supabase
            .from(
              "product_images"
            )
            .select("*")
            .eq(
              "product_id",
              productUuid
            )
            .order(
              "sort_order",
              {
                ascending:
                  true,
              }
            );


        if (
          imageError
        ) {
          console.error(
            imageError
          );

          alert(
            "商品写真を読み込めませんでした：" +
              imageError.message
          );

          return;
        }


        const loadedImages =
          imageData ?? [];


        // --------------------------------------------------------
        // private StorageなのでSigned URLを作る
        // --------------------------------------------------------

        const imagesWithPreview =
          await Promise.all(
            loadedImages.map(
              async (
                image:
                  ProductImage
              ) => {
                const {
                  data,
                  error,
                } =
                  await supabase
                    .storage
                    .from(
                      "product-images-private"
                    )
                    .createSignedUrl(
                      image.storage_path,
                      60 * 60
                    );


                if (
                  error
                ) {
                  console.error(
                    error
                  );

                  return image;
                }


                return {
                  ...image,

                  preview_url:
                    data.signedUrl,
                };
              }
            )
          );


        setImages(
          imagesWithPreview
        );
      },

      [
        productUuid,
        supabase,
      ]
    );


  // ============================================================
  // 商品読み込み
  // ============================================================

  useEffect(
    () => {
      async function loadProduct() {
        setLoading(
          true
        );


        const {
          data,
          error,
        } =
          await supabase
            .from(
              "products"
            )
            .select("*")
            .eq(
              "id",
              productUuid
            )
            .eq(
              "market_id",
              marketUuid
            )
            .single();


        if (
          error
        ) {
          console.error(
            error
          );


          alert(
            "商品を読み込めませんでした：" +
              error.message
          );


          setLoading(
            false
          );


          return;
        }


        setProduct(
          data
        );


        setName(
          data.name
        );


        setPrice(
          String(
            data.price
          )
        );


        setDescription(
          data.description ??
            ""
        );


        setInitialState(
          data.initial_state
        );


        await loadImages();


        setLoading(
          false
        );
      }


      loadProduct();

    },

    [
      marketUuid,
      productUuid,
      supabase,
      loadImages,
    ]
  );


  // ============================================================
  // 商品情報保存
  // ============================================================

  async function handleSave() {
    if (
      !name.trim()
    ) {
      alert(
        "商品名を入力してください。"
      );

      return;
    }


    const priceNumber =
      Number(
        price
      );


    if (
      !Number.isInteger(
        priceNumber
      ) ||
      priceNumber <
        0
    ) {
      alert(
        "価格は0以上の整数で入力してください。"
      );

      return;
    }


    setSaving(
      true
    );


    const {
      error,
    } =
      await supabase
        .from(
          "products"
        )
        .update({
          name:
            name.trim(),

          price:
            priceNumber,

          description:
            description.trim(),

          initial_state:
            initialState,

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          productUuid
        )
        .eq(
          "market_id",
          marketUuid
        );


    setSaving(
      false
    );


    if (
      error
    ) {
      console.error(
        error
      );


      alert(
        "商品の保存に失敗しました：" +
          error.message
      );


      return;
    }


    setProduct(
      (
        current
      ) => {
        if (
          !current
        ) {
          return current;
        }


        return {
          ...current,

          name:
            name.trim(),

          price:
            priceNumber,

          description:
            description.trim(),

          initial_state:
            initialState,
        };
      }
    );
  }


  // ============================================================
  // 画像追加
  // ============================================================

  async function handleImageUpload(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target
        .files?.[0];


    event.target.value =
      "";


    if (
      !file
    ) {
      return;
    }


    const allowedTypes =
      [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      alert(
        "PNG / JPG / JPEG / WebP の画像を選択してください。"
      );

      return;
    }


    const maxFileSize =
      20 *
      1024 *
      1024;


    if (
      file.size >
      maxFileSize
    ) {
      alert(
        "画像サイズは20MB以下にしてください。"
      );

      return;
    }


    setUploading(
      true
    );


    // ----------------------------------------------------------
    // User
    // ----------------------------------------------------------

    const {
      data:
        userData,

      error:
        userError,
    } =
      await supabase.auth
        .getUser();


    if (
      userError ||
      !userData.user
    ) {
      console.error(
        userError
      );


      alert(
        "ログイン情報を取得できませんでした。"
      );


      setUploading(
        false
      );


      return;
    }


    const userId =
      userData.user.id;


    // ----------------------------------------------------------
    // 拡張子
    // ----------------------------------------------------------

    let extension =
      "jpg";


    if (
      file.type ===
      "image/png"
    ) {
      extension =
        "png";
    }


    if (
      file.type ===
      "image/webp"
    ) {
      extension =
        "webp";
    }


    // ----------------------------------------------------------
    // Storage path
    // ----------------------------------------------------------

    const randomId =
      crypto.randomUUID();


    const fileName =
      `${Date.now()}-${randomId}.${extension}`;


    const storagePath =
      `${userId}/${productUuid}/${fileName}`;


    // ----------------------------------------------------------
    // Storage upload
    // ----------------------------------------------------------

    const {
      error:
        uploadError,
    } =
      await supabase
        .storage
        .from(
          "product-images-private"
        )
        .upload(
          storagePath,
          file,
          {
            cacheControl:
              "3600",

            upsert:
              false,

            contentType:
              file.type,
          }
        );


    if (
      uploadError
    ) {
      console.error(
        uploadError
      );


      alert(
        "画像アップロードに失敗しました：" +
          uploadError.message
      );


      setUploading(
        false
      );


      return;
    }


    // ----------------------------------------------------------
    // 次のsort_order
    // ----------------------------------------------------------

    let nextSortOrder =
      0;


    if (
      images.length >
      0
    ) {
      nextSortOrder =
        Math.max(
          ...images.map(
            (
              image
            ) =>
              image.sort_order
          )
        ) + 1;
    }


    // ----------------------------------------------------------
    // DB登録
    // ----------------------------------------------------------

    const {
      error:
        insertError,
    } =
      await supabase
        .from(
          "product_images"
        )
        .insert({
          product_id:
            productUuid,

          sort_order:
            nextSortOrder,

          storage_path:
            storagePath,
        });


    if (
      insertError
    ) {
      console.error(
        insertError
      );


      // DB登録失敗ならStorageを戻す
      await supabase
        .storage
        .from(
          "product-images-private"
        )
        .remove(
          [
            storagePath,
          ]
        );


      alert(
        "画像情報の保存に失敗しました：" +
          insertError.message
      );


      setUploading(
        false
      );


      return;
    }


    await loadImages();


    setUploading(
      false
    );
  }


  // ============================================================
  // 写真並び替え
  // ============================================================

  async function handleMoveImage(
    index: number,

    direction:
      | "up"
      | "down"
  ) {
    const targetIndex =
      direction ===
      "up"
        ? index - 1
        : index + 1;


    if (
      targetIndex <
        0 ||
      targetIndex >=
        images.length
    ) {
      return;
    }


    const currentImage =
      images[
        index
      ];


    const targetImage =
      images[
        targetIndex
      ];


    setMovingImageId(
      currentImage.id
    );


    // ----------------------------------------------------------
    // current
    // ----------------------------------------------------------

    const {
      error:
        currentError,
    } =
      await supabase
        .from(
          "product_images"
        )
        .update({
          sort_order:
            targetImage
              .sort_order,
        })
        .eq(
          "id",
          currentImage.id
        );


    if (
      currentError
    ) {
      console.error(
        currentError
      );


      alert(
        "写真の並び替えに失敗しました。"
      );


      setMovingImageId(
        null
      );


      return;
    }


    // ----------------------------------------------------------
    // target
    // ----------------------------------------------------------

    const {
      error:
        targetError,
    } =
      await supabase
        .from(
          "product_images"
        )
        .update({
          sort_order:
            currentImage
              .sort_order,
        })
        .eq(
          "id",
          targetImage.id
        );


    if (
      targetError
    ) {
      console.error(
        targetError
      );


      alert(
        "写真の並び替えに失敗しました。"
      );


      setMovingImageId(
        null
      );


      return;
    }


    await loadImages();


    setMovingImageId(
      null
    );
  }


  // ============================================================
  // 写真削除
  // ============================================================

  async function handleDeleteImage(
    image:
      ProductImage
  ) {
    const confirmed =
      window.confirm(
        "この写真を削除しますか？"
      );


    if (
      !confirmed
    ) {
      return;
    }


    setDeletingImageId(
      image.id
    );


    // ----------------------------------------------------------
    // Storage
    // ----------------------------------------------------------

    const {
      error:
        storageError,
    } =
      await supabase
        .storage
        .from(
          "product-images-private"
        )
        .remove(
          [
            image.storage_path,
          ]
        );


    if (
      storageError
    ) {
      console.error(
        storageError
      );


      alert(
        "画像ファイルを削除できませんでした：" +
          storageError.message
      );


      setDeletingImageId(
        null
      );


      return;
    }


    // ----------------------------------------------------------
    // DB
    // ----------------------------------------------------------

    const {
      error:
        databaseError,
    } =
      await supabase
        .from(
          "product_images"
        )
        .delete()
        .eq(
          "id",
          image.id
        );


    if (
      databaseError
    ) {
      console.error(
        databaseError
      );


      alert(
        "画像情報を削除できませんでした：" +
          databaseError.message
      );


      setDeletingImageId(
        null
      );


      return;
    }


    // ----------------------------------------------------------
    // 残り画像の番号整理
    // ----------------------------------------------------------

    const remainingImages =
      images.filter(
        (
          item
        ) =>
          item.id !==
          image.id
      );


    for (
      let index = 0;
      index <
      remainingImages.length;
      index++
    ) {
      const {
        error:
          reorderError,
      } =
        await supabase
          .from(
            "product_images"
          )
          .update({
            sort_order:
              index,
          })
          .eq(
            "id",
            remainingImages[
              index
            ].id
          );


      if (
        reorderError
      ) {
        console.error(
          reorderError
        );
      }
    }


    await loadImages();


    setDeletingImageId(
      null
    );
  }


  // ============================================================
  // Loading
  // ============================================================

  if (
    loading
  ) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">

        <div className="mx-auto max-w-4xl px-6 py-10">
          読み込み中...
        </div>

      </main>
    );
  }


  if (
    !product
  ) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">

        <div className="mx-auto max-w-4xl px-6 py-10">

          <p>
            商品が見つかりません。
          </p>


          <button
            type="button"

            onClick={() =>
              router.push(
                `/markets/${marketUuid}`
              )
            }

            className="mt-5 text-emerald-400"
          >
            ← 販売会へ戻る
          </button>

        </div>

      </main>
    );
  }


  const processing =
    saving ||
    uploading ||
    deletingImageId !==
      null ||
    movingImageId !==
      null;


  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">


        {/* ====================================================
            販売会へ戻る
        ==================================================== */}

        <button
          type="button"

          disabled={
            processing
          }

          onClick={() =>
            router.push(
              `/markets/${marketUuid}`
            )
          }

          className="mb-8 text-sm text-slate-400 transition hover:text-white disabled:opacity-40"
        >
          ← 販売会へ戻る
        </button>


        {/* ====================================================
            Header
        ==================================================== */}

        <div className="mb-10">

          <p className="text-sm font-semibold tracking-[0.25em] text-emerald-400">
            VRC LIVE MARKET
          </p>


          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            商品を編集
          </h1>


          <p className="mt-3 text-slate-400">
            商品情報と商品写真を変更できます。
          </p>

        </div>


        {/* ====================================================
            商品情報
        ==================================================== */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-8">

          <h2 className="mb-6 text-2xl font-bold">
            商品情報
          </h2>


          <div className="space-y-6">


            {/* 商品名 */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-300">
                商品名
              </label>


              <input
                type="text"

                value={
                  name
                }

                disabled={
                  processing
                }

                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }

                placeholder="例：ブラジル産 パイライト"

                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500 disabled:opacity-50"
              />

            </div>


            {/* 価格 */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-300">
                価格
              </label>


              <input
                type="number"

                min="0"

                value={
                  price
                }

                disabled={
                  processing
                }

                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }

                placeholder="例：4800"

                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500 disabled:opacity-50"
              />


              <p className="mt-2 text-sm text-slate-500">
                円単位で入力してください。
              </p>

            </div>


            {/* 商品説明 */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-300">
                商品説明
              </label>


              <textarea
                value={
                  description
                }

                disabled={
                  processing
                }

                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }

                rows={5}

                placeholder="例：結晶面がきれいなパイライトです。"

                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500 disabled:opacity-50"
              />

            </div>


            {/* 初期状態 */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-300">
                初期状態
              </label>


              <select
                value={
                  initialState
                }

                disabled={
                  processing
                }

                onChange={(e) =>
                  setInitialState(
                    e.target.value
                  )
                }

                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500 disabled:opacity-50"
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


            {/* Save */}

            <button
              type="button"

              onClick={
                handleSave
              }

              disabled={
                processing
              }

              className="w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {saving
                ? "保存中..."
                : "商品情報を保存"}

            </button>

          </div>

        </section>


        {/* ====================================================
            商品写真
        ==================================================== */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-8">


          {/* Header */}

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                商品写真
              </h2>


              <p className="mt-2 text-sm text-slate-400">
                写真の順番はVRChatで表示される順番になります。
              </p>

            </div>


            {/* Upload */}

            <label
              className={`inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold transition ${
                processing
                  ? "cursor-not-allowed bg-slate-700 text-slate-400"
                  : "cursor-pointer bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              }`}
            >

              {uploading
                ? "アップロード中..."
                : "＋ 写真を追加"}


              <input
                type="file"

                accept="image/jpeg,image/png,image/webp"

                disabled={
                  processing
                }

                onChange={
                  handleImageUpload
                }

                className="hidden"
              />

            </label>

          </div>


          {/* Info */}

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">

            <p className="text-sm text-slate-400">
              PNG・JPG・JPEG・WebPに対応しています。
            </p>


            <p className="mt-1 text-sm text-slate-500">
              元画像は非公開で保存され、公開時にVRChat用JPEGへ変換されます。
            </p>

          </div>


          {/* No image */}

          {images.length ===
          0 ? (

            <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-500">
              まだ商品写真がありません。
            </div>

          ) : (

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {images.map(
                (
                  image,
                  index
                ) => (

                  <div
                    key={
                      image.id
                    }

                    className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
                  >


                    {/* Image */}

                    <div className="relative aspect-square bg-slate-900">

                      {image.preview_url ? (

                        <img
                          src={
                            image.preview_url
                          }

                          alt={`商品写真 ${
                            index +
                            1
                          }`}

                          className="h-full w-full object-contain"
                        />

                      ) : (

                        <div className="flex h-full items-center justify-center text-sm text-slate-500">
                          プレビューできません
                        </div>

                      )}


                      <div className="absolute left-3 top-3 rounded-lg bg-black/70 px-3 py-1 text-sm font-semibold">
                        写真{" "}
                        {index + 1}
                      </div>

                    </div>


                    {/* Actions */}

                    <div className="space-y-3 p-4">

                      <p className="text-sm font-medium">
                        表示順{" "}
                        {index + 1}
                      </p>


                      <div className="grid grid-cols-2 gap-2">

                        <button
                          type="button"

                          onClick={() =>
                            handleMoveImage(
                              index,
                              "up"
                            )
                          }

                          disabled={
                            processing ||
                            index ===
                              0
                          }

                          className="rounded-lg border border-slate-700 px-3 py-2 text-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ← 前へ
                        </button>


                        <button
                          type="button"

                          onClick={() =>
                            handleMoveImage(
                              index,
                              "down"
                            )
                          }

                          disabled={
                            processing ||
                            index ===
                              images.length -
                                1
                          }

                          className="rounded-lg border border-slate-700 px-3 py-2 text-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          次へ →
                        </button>

                      </div>


                      <button
                        type="button"

                        onClick={() =>
                          handleDeleteImage(
                            image
                          )
                        }

                        disabled={
                          processing
                        }

                        className="w-full rounded-lg border border-red-900 px-3 py-2 text-sm text-red-400 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        {deletingImageId ===
                        image.id
                          ? "削除中..."
                          : "写真を削除"}

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