"use client";

import Link from "next/link";
import {
  DragEvent,
  KeyboardEvent,
  useEffect,
  useRef,
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

type SaleStatus =
  | "READY"
  | "LIVE"
  | "ENDED";

type Market = {
  id: string;
  market_id: string;
  title: string;
  seller_display_names: string[];
  staff_display_names: string[];
  stream_url: string;
  status: string;
  sale_status: SaleStatus;
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

type ApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

type DeleteProductResponse =
  ApiResponse & {
    productId?: string;
    productName?: string;
    deletedImageCount?: number;
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
  // 販売会
  // ==========================================================

  const [
    market,
    setMarket,
  ] =
    useState<Market | null>(
      null
    );

  const [
    title,
    setTitle,
  ] =
    useState("");

  const [
    sellerName,
    setSellerName,
  ] =
    useState("");

  const [
    staffNames,
    setStaffNames,
  ] =
    useState<string[]>([]);

  const [
    newStaffName,
    setNewStaffName,
  ] =
    useState("");

  const [
    streamUrl,
    setStreamUrl,
  ] =
    useState("");

  // ==========================================================
  // 商品
  // ==========================================================

  const [
    products,
    setProducts,
  ] =
    useState<Product[]>([]);

  // ==========================================================
  // 状態
  // ==========================================================

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
    publishing,
    setPublishing,
  ] =
    useState(false);

  const [
    unpublishing,
    setUnpublishing,
  ] =
    useState(false);

  const [
    deletingMarket,
    setDeletingMarket,
  ] =
    useState(false);

  const [
    changingSaleStatus,
    setChangingSaleStatus,
  ] =
    useState(false);

  const [
    deletingProductId,
    setDeletingProductId,
  ] =
    useState<string | null>(
      null
    );

  // ==========================================================
  // 商品並び替え
  // ==========================================================

  const [
    draggingProductId,
    setDraggingProductId,
  ] =
    useState<string | null>(
      null
    );

  const [
    dragOverProductId,
    setDragOverProductId,
  ] =
    useState<string | null>(
      null
    );

  const [
    reorderingProducts,
    setReorderingProducts,
  ] =
    useState(false);

  const [
    productOrderChanged,
    setProductOrderChanged,
  ] =
    useState(false);

  const dragProductsRef =
    useRef<Product[]>([]);

  const dragOriginalProductsRef =
    useRef<Product[]>([]);

  // ==========================================================
  // 読み込み
  // ==========================================================

  async function loadMarketData() {
    setLoading(true);

    const {
      data: marketData,
      error: marketError,
    } =
      await supabase
        .from("markets")
        .select("*")
        .eq(
          "id",
          marketUuid
        )
        .single();

    if (
      marketError
    ) {
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
      marketData
        .staff_display_names ??
        []
    );

    setStreamUrl(
      marketData
        .stream_url ??
        ""
    );

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
            ascending:
              true,
          }
        );

    if (
      productError
    ) {
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
      const loadedProducts =
        (
          productData ??
          []
        ) as Product[];

      setProducts(
        loadedProducts
      );

      dragProductsRef.current =
        loadedProducts;
    }

    setLoading(false);
  }

  useEffect(() => {
    loadMarketData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketUuid]);

  // ==========================================================
  // スタッフ
  // ==========================================================

  function handleAddStaff() {
    const trimmedName =
      newStaffName.trim();

    if (
      !trimmedName
    ) {
      return;
    }

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

    const alreadyExists =
      staffNames.some(
        (
          staffName
        ) =>
          staffName
            .trim()
            .toLowerCase() ===
          trimmedName
            .toLowerCase()
      );

    if (
      alreadyExists
    ) {
      return;
    }

    setStaffNames(
      (
        current
      ) => [
        ...current,
        trimmedName,
      ]
    );

    setNewStaffName("");
  }

  function handleStaffKeyDown(
    event:
      KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key ===
      "Enter"
    ) {
      event.preventDefault();

      handleAddStaff();
    }
  }

  function handleRemoveStaff(
    index: number
  ) {
    setStaffNames(
      (
        current
      ) =>
        current.filter(
          (
            _,
            currentIndex
          ) =>
            currentIndex !==
            index
        )
    );
  }

  // ==========================================================
  // 配信URL
  // ==========================================================

  function isValidStreamUrl(
    value: string
  ) {
    if (
      !value
    ) {
      return true;
    }

    try {
      const parsedUrl =
        new URL(
          value
        );

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
  // 販売会保存
  // ==========================================================

  async function handleSave() {
    if (
      !title.trim()
    ) {
      alert(
        "販売会名を入力してください。"
      );
      return;
    }

    if (
      !sellerName.trim()
    ) {
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
        "配信URLの形式を確認してください。"
      );
      return;
    }

    const cleanedStaffNames =
      staffNames
        .map(
          (
            name
          ) =>
            name.trim()
        )
        .filter(
          (
            name
          ) =>
            name.length >
            0
        );

    setSaving(
      true
    );

    const {
      error,
    } =
      await supabase
        .from(
          "markets"
        )
        .update({
          title:
            title.trim(),

          seller_display_names:
            [
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

    setSaving(
      false
    );

    if (
      error
    ) {
      console.error(
        "Market save error:",
        error
      );

      alert(
        "保存に失敗しました：" +
          error.message
      );

      return;
    }

    setStaffNames(
      cleanedStaffNames
    );

    setStreamUrl(
      cleanedStreamUrl
    );

    setMarket(
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

          title:
            title.trim(),

          seller_display_names:
            [
              sellerName.trim(),
            ],

          staff_display_names:
            cleanedStaffNames,

          stream_url:
            cleanedStreamUrl,
        };
      }
    );
  }

  // ==========================================================
  // 販売状態変更
  // ==========================================================

  async function handleChangeSaleStatus(
  nextStatus:
    SaleStatus
) {
  if (
    !market
  ) {
    return;
  }

  // --------------------------------------------------------
  // 販売開始は「公開中」のときだけ
  // --------------------------------------------------------

  if (
    nextStatus ===
      "LIVE" &&
    market.status !==
      "published"
  ) {
    alert(
      "販売を開始する前に、販売会を公開してください。"
    );

    return;
  }

  setChangingSaleStatus(
    true
  );

  try {
    // ------------------------------------------------------
    // ログイン情報取得
    // ------------------------------------------------------

    const {
      data:
        sessionData,

      error:
        sessionError,
    } =
      await supabase.auth
        .getSession();

    if (
      sessionError ||
      !sessionData.session
    ) {
      alert(
        "ログイン情報を確認できませんでした。"
      );

      return;
    }

    // ------------------------------------------------------
    // 販売状態専用APIを呼ぶ
    //
    // このAPIが
    // 1. Supabase
    // 2. GitHub market.json
    //
    // の両方を更新する
    // ------------------------------------------------------

    const response =
      await fetch(
        `/api/markets/${marketUuid}/sale-status`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${sessionData.session.access_token}`,
          },

          body:
            JSON.stringify({
              saleStatus:
                nextStatus,
            }),
        }
      );

    // ------------------------------------------------------
    // API応答確認
    // ------------------------------------------------------

    const contentType =
      response.headers.get(
        "content-type"
      ) ??
      "";

    if (
      !contentType.includes(
        "application/json"
      )
    ) {
      const responseText =
        await response.text();

      console.error(
        "Sale status API invalid response:",
        responseText
      );

      alert(
        "販売状態APIから正しい応答を受け取れませんでした。"
      );

      return;
    }

    const result =
      (
        await response.json()
      ) as ApiResponse & {
        saleStatus?:
          SaleStatus;

        runtimeUpdated?:
          boolean;
      };

    // ------------------------------------------------------
    // APIエラー
    // ------------------------------------------------------

    if (
      !response.ok
    ) {
      alert(
        result.error ??
          "販売状態の変更に失敗しました。"
      );

      return;
    }

    // ------------------------------------------------------
    // Web画面も新しい状態へ変更
    // ------------------------------------------------------

    const updatedStatus =
      result.saleStatus ??
      nextStatus;

    setMarket(
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

          sale_status:
            updatedStatus,
        };
      }
    );

  } catch (
    error
  ) {
    console.error(
      "Sale status update error:",
      error
    );

    alert(
      "販売状態の変更中に通信エラーが発生しました。"
    );

  } finally {
    setChangingSaleStatus(
      false
    );
  }
}

  // ==========================================================
  // 商品順保存
  // ==========================================================

  async function saveProductOrder(
    orderedProducts:
      Product[]
  ) {
    setReorderingProducts(
      true
    );

    try {
      const temporaryResults =
        await Promise.all(
          orderedProducts.map(
            (
              product,
              index
            ) =>
              supabase
                .from(
                  "products"
                )
                .update({
                  sort_order:
                    10000 +
                    index,
                })
                .eq(
                  "id",
                  product.id
                )
                .eq(
                  "market_id",
                  marketUuid
                )
          )
        );

      const temporaryError =
        temporaryResults.find(
          (
            result
          ) =>
            result.error
        )?.error;

      if (
        temporaryError
      ) {
        throw temporaryError;
      }

      const finalResults =
        await Promise.all(
          orderedProducts.map(
            (
              product,
              index
            ) =>
              supabase
                .from(
                  "products"
                )
                .update({
                  sort_order:
                    index,
                })
                .eq(
                  "id",
                  product.id
                )
                .eq(
                  "market_id",
                  marketUuid
                )
          )
        );

      const finalError =
        finalResults.find(
          (
            result
          ) =>
            result.error
        )?.error;

      if (
        finalError
      ) {
        throw finalError;
      }

      const correctedProducts =
        orderedProducts.map(
          (
            product,
            index
          ) => ({
            ...product,

            sort_order:
              index,
          })
        );

      setProducts(
        correctedProducts
      );

      dragProductsRef.current =
        correctedProducts;

      setProductOrderChanged(
        true
      );
    } catch (
      error
    ) {
      console.error(
        "Product reorder error:",
        error
      );

      alert(
        "商品の並び替えに失敗しました。元の順番に戻します。"
      );

      setProducts(
        dragOriginalProductsRef.current
      );

      dragProductsRef.current =
        dragOriginalProductsRef.current;
    } finally {
      setReorderingProducts(
        false
      );
    }
  }

  // ==========================================================
  // スマホ用 ↑ ↓ 並び替え
  // ==========================================================

  async function handleMoveProduct(
    productId:
      string,

    direction:
      | "up"
      | "down"
  ) {
    if (
      reorderingProducts
    ) {
      return;
    }

    const currentIndex =
      products.findIndex(
        (
          product
        ) =>
          product.id ===
          productId
      );

    if (
      currentIndex <
      0
    ) {
      return;
    }

    const targetIndex =
      direction ===
        "up"
        ? currentIndex -
          1
        : currentIndex +
          1;

    if (
      targetIndex <
        0 ||
      targetIndex >=
        products.length
    ) {
      return;
    }

    const originalProducts =
      [
        ...products,
      ];

    const reorderedProducts =
      [
        ...products,
      ];

    const [
      movedProduct,
    ] =
      reorderedProducts.splice(
        currentIndex,
        1
      );

    reorderedProducts.splice(
      targetIndex,
      0,
      movedProduct
    );

    dragOriginalProductsRef.current =
      originalProducts;

    dragProductsRef.current =
      reorderedProducts;

    setProducts(
      reorderedProducts
    );

    await saveProductOrder(
      reorderedProducts
    );
  }

  // ==========================================================
  // PC Drag & Drop
  // ==========================================================

  function handleDragStart(
    event:
      DragEvent<HTMLDivElement>,

    productId:
      string
  ) {
    if (
      reorderingProducts
    ) {
      event.preventDefault();

      return;
    }

    const currentProducts =
      [
        ...products,
      ];

    dragOriginalProductsRef.current =
      currentProducts;

    dragProductsRef.current =
      currentProducts;

    setDraggingProductId(
      productId
    );

    setDragOverProductId(
      null
    );

    event.dataTransfer.effectAllowed =
      "move";

    event.dataTransfer.setData(
      "text/plain",
      productId
    );
  }

  function handleDragOver(
    event:
      DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    event.dataTransfer.dropEffect =
      "move";
  }

  function handleDragEnter(
    targetProductId:
      string
  ) {
    if (
      !draggingProductId
    ) {
      return;
    }

    if (
      draggingProductId ===
      targetProductId
    ) {
      return;
    }

    const currentProducts =
      [
        ...dragProductsRef.current,
      ];

    const sourceIndex =
      currentProducts.findIndex(
        (
          product
        ) =>
          product.id ===
          draggingProductId
      );

    const targetIndex =
      currentProducts.findIndex(
        (
          product
        ) =>
          product.id ===
          targetProductId
      );

    if (
      sourceIndex <
        0 ||
      targetIndex <
        0 ||
      sourceIndex ===
        targetIndex
    ) {
      return;
    }

    const [
      movedProduct,
    ] =
      currentProducts.splice(
        sourceIndex,
        1
      );

    currentProducts.splice(
      targetIndex,
      0,
      movedProduct
    );

    dragProductsRef.current =
      currentProducts;

    setProducts(
      currentProducts
    );

    setDragOverProductId(
      targetProductId
    );
  }

  function handleDrop(
    event:
      DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setDragOverProductId(
      null
    );
  }

  async function handleDragEnd() {
    if (
      !draggingProductId
    ) {
      return;
    }

    const finalProducts =
      [
        ...dragProductsRef.current,
      ];

    const originalProducts =
      [
        ...dragOriginalProductsRef.current,
      ];

    setDraggingProductId(
      null
    );

    setDragOverProductId(
      null
    );

    const changed =
      finalProducts.some(
        (
          product,
          index
        ) =>
          product.id !==
          originalProducts[
            index
          ]?.id
      );

    if (
      !changed
    ) {
      return;
    }

    await saveProductOrder(
      finalProducts
    );
  }

  // ==========================================================
  // 商品削除
  // ==========================================================

  async function handleDeleteProduct(
    product:
      Product
  ) {
    if (
      !market
    ) {
      return;
    }

    if (
      market.status ===
      "published"
    ) {
      alert(
        "公開中の商品は削除できません。\n先に販売会の公開を解除してください。"
      );

      return;
    }

    const confirmed =
      window.confirm(
        `「${product.name}」を削除しますか？\n商品写真もすべて削除されます。`
      );

    if (
      !confirmed
    ) {
      return;
    }

    setDeletingProductId(
      product.id
    );

    try {
      const {
        data:
          sessionData,

        error:
          sessionError,
      } =
        await supabase.auth
          .getSession();

      if (
        sessionError ||
        !sessionData.session
      ) {
        alert(
          "ログイン情報を確認できませんでした。"
        );

        return;
      }

      const response =
        await fetch(
          `/api/markets/${marketUuid}/products/${product.id}/delete`,
          {
            method:
              "DELETE",

            headers: {
              Authorization:
                `Bearer ${sessionData.session.access_token}`,
            },
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) ??
        "";

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        console.error(
          await response.text()
        );

        alert(
          "商品削除APIから正しい応答を受け取れませんでした。"
        );

        return;
      }

      const result =
        (
          await response.json()
        ) as DeleteProductResponse;

      if (
        !response.ok
      ) {
        alert(
          result.error ??
            "商品の削除に失敗しました。"
        );

        return;
      }

      const remainingProducts =
        products
          .filter(
            (
              item
            ) =>
              item.id !==
              product.id
          )
          .map(
            (
              item,
              index
            ) => ({
              ...item,

              sort_order:
                index,
            })
          );

      setProducts(
        remainingProducts
      );

      dragProductsRef.current =
        remainingProducts;
    } catch (
      error
    ) {
      console.error(
        "Delete product error:",
        error
      );

      alert(
        "商品の削除中に通信エラーが発生しました。"
      );
    } finally {
      setDeletingProductId(
        null
      );
    }
  }

  // ==========================================================
  // 公開
  // ==========================================================

  async function handlePublish() {
    if (
      !market
    ) {
      return;
    }

    if (
      products.length ===
      0
    ) {
      alert(
        "商品が1件もありません。"
      );

      return;
    }

    const confirmed =
      window.confirm(
        market.status ===
          "published"
          ? "販売会を再公開しますか？"
          : "販売会を公開しますか？"
      );

    if (
      !confirmed
    ) {
      return;
    }

    setPublishing(
      true
    );

    try {
      const {
        data:
          sessionData,

        error:
          sessionError,
      } =
        await supabase.auth
          .getSession();

      if (
        sessionError ||
        !sessionData.session
      ) {
        alert(
          "ログイン情報を確認できませんでした。"
        );

        return;
      }

      const response =
        await fetch(
          `/api/markets/${marketUuid}/publish`,
          {
            method:
              "POST",

            headers: {
              Authorization:
                `Bearer ${sessionData.session.access_token}`,
            },
          }
        );

      const result =
        (
          await response.json()
        ) as ApiResponse;

      if (
        !response.ok
      ) {
        alert(
          result.error ??
            "公開に失敗しました。"
        );

        return;
      }

      setProductOrderChanged(
        false
      );

      await loadMarketData();
    } catch (
      error
    ) {
      console.error(
        "Publish error:",
        error
      );

      alert(
        "公開処理中に通信エラーが発生しました。"
      );
    } finally {
      setPublishing(
        false
      );
    }
  }

  // ==========================================================
  // 公開解除
  // ==========================================================

  async function handleUnpublish() {
    if (
      market?.sale_status ===
      "LIVE"
    ) {
      alert(
        "販売中です。\n先に「販売終了」を押してください。"
      );

      return;
    }

    const confirmed =
      window.confirm(
        "販売会の公開を解除しますか？\n商品や設定は削除されません。"
      );

    if (
      !confirmed
    ) {
      return;
    }

    setUnpublishing(
      true
    );

    try {
      const {
        data:
          sessionData,

        error:
          sessionError,
      } =
        await supabase.auth
          .getSession();

      if (
        sessionError ||
        !sessionData.session
      ) {
        alert(
          "ログイン情報を確認できませんでした。"
        );

        return;
      }

      const response =
        await fetch(
          `/api/markets/${marketUuid}/unpublish`,
          {
            method:
              "POST",

            headers: {
              Authorization:
                `Bearer ${sessionData.session.access_token}`,
            },
          }
        );

      const result =
        (
          await response.json()
        ) as ApiResponse;

      if (
        !response.ok
      ) {
        alert(
          result.error ??
            "公開解除に失敗しました。"
        );

        return;
      }

      setProductOrderChanged(
        false
      );

      await loadMarketData();
    } catch (
      error
    ) {
      console.error(
        "Unpublish error:",
        error
      );

      alert(
        "公開解除中に通信エラーが発生しました。"
      );
    } finally {
      setUnpublishing(
        false
      );
    }
  }

  // ==========================================================
  // 販売会削除
  // ==========================================================

  async function handleDeleteMarket() {
    if (
      !market
    ) {
      return;
    }

    if (
      market.sale_status ===
      "LIVE"
    ) {
      alert(
        "販売中の販売会は削除できません。\n先に販売を終了してください。"
      );

      return;
    }

    const firstConfirmed =
      window.confirm(
        [
          "この販売会を削除しますか？",
          "",
          `販売会：${market.title}`,
          "",
          "商品・商品写真もすべて削除されます。",
        ].join(
          "\n"
        )
      );

    if (
      !firstConfirmed
    ) {
      return;
    }

    const secondConfirmed =
      window.confirm(
        [
          "最終確認です。",
          "",
          "本当に販売会を削除しますか？",
          "",
          "この操作は元に戻せません。",
        ].join(
          "\n"
        )
      );

    if (
      !secondConfirmed
    ) {
      return;
    }

    setDeletingMarket(
      true
    );

    try {
      const {
        data:
          sessionData,

        error:
          sessionError,
      } =
        await supabase.auth
          .getSession();

      if (
        sessionError ||
        !sessionData.session
      ) {
        alert(
          "ログイン情報を確認できませんでした。"
        );

        return;
      }

      const response =
        await fetch(
          `/api/markets/${marketUuid}/delete`,
          {
            method:
              "DELETE",

            headers: {
              Authorization:
                `Bearer ${sessionData.session.access_token}`,
            },
          }
        );

      const result =
        (
          await response.json()
        ) as ApiResponse;

      if (
        !response.ok
      ) {
        alert(
          result.error ??
            "販売会の削除に失敗しました。"
        );

        return;
      }

      router.push(
        "/"
      );

      router.refresh();
    } catch (
      error
    ) {
      console.error(
        "Delete market error:",
        error
      );

      alert(
        "販売会削除中に通信エラーが発生しました。"
      );
    } finally {
      setDeletingMarket(
        false
      );
    }
  }

  // ==========================================================
  // Loading
  // ==========================================================

  if (
    loading
  ) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          読み込み中...
        </div>

      </main>
    );
  }

  if (
    !market
  ) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          販売会が見つかりません。
        </div>

      </main>
    );
  }

  const processing =
    saving ||
    publishing ||
    unpublishing ||
    deletingMarket ||
    changingSaleStatus ||
    deletingProductId !==
      null;

  const saleStatus =
    market.sale_status ??
    "READY";

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">

        {/* 戻る */}

        <button
          type="button"

          onClick={() =>
            router.push(
              "/"
            )
          }

          disabled={
            processing
          }

          className="mb-6 min-h-11 text-sm text-slate-400 transition hover:text-white disabled:opacity-40 sm:mb-8"
        >
          ← 販売会一覧へ戻る
        </button>


        {/* Header */}

        <div className="mb-8 sm:mb-10">

          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 sm:text-sm sm:tracking-[0.25em]">
            VRC LIVE MARKET
          </p>


          <h1 className="mt-3 text-2xl font-bold sm:text-4xl">
            販売会を編集
          </h1>


          <p className="mt-2 text-sm text-slate-400 sm:mt-3 sm:text-base">
            販売会の設定と商品を管理します。
          </p>

        </div>


        {/* ==================================================
            販売会設定
        ================================================== */}

        <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:gap-8">


          {/* 左 */}

          <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:space-y-7 sm:p-8">


            {/* 販売会名 */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                販売会名
              </label>


              <input
                type="text"

                value={
                  title
                }

                disabled={
                  processing
                }

                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }

                className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base outline-none transition focus:border-emerald-500 disabled:opacity-50"
              />

            </div>


            {/* 販売者 */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                VRChat販売者名
              </label>


              <input
                type="text"

                value={
                  sellerName
                }

                disabled={
                  processing
                }

                onChange={(e) =>
                  setSellerName(
                    e.target.value
                  )
                }

                className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base outline-none transition focus:border-emerald-500 disabled:opacity-50"
              />

            </div>


            {/* スタッフ */}

            <div className="border-t border-slate-800 pt-6">

              <h2 className="text-lg font-bold">
                スタッフ
              </h2>


              <p className="mt-1 text-sm text-slate-400">
                VRChat内で販売操作を行えるスタッフを登録します。
              </p>


              {staffNames.length ===
              0 ? (

                <div className="mt-4 rounded-xl border border-dashed border-slate-700 p-4 text-center text-sm text-slate-500">
                  スタッフはまだ登録されていません。
                </div>

              ) : (

                <div className="mt-4 space-y-2">

                  {staffNames.map(
                    (
                      staffName,
                      index
                    ) => (

                      <div
                        key={`${staffName}-${index}`}

                        className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-3"
                      >

                        <p className="min-w-0 flex-1 truncate">
                          {staffName}
                        </p>


                        <button
                          type="button"

                          disabled={
                            processing
                          }

                          onClick={() =>
                            handleRemoveStaff(
                              index
                            )
                          }

                          className="min-h-11 rounded-lg px-3 text-sm text-red-400 transition hover:bg-red-950 disabled:opacity-40"
                        >
                          削除
                        </button>

                      </div>

                    )
                  )}

                </div>

              )}


              <div className="mt-4 flex flex-col gap-2 sm:flex-row">

                <input
                  type="text"

                  value={
                    newStaffName
                  }

                  disabled={
                    processing
                  }

                  onChange={(e) =>
                    setNewStaffName(
                      e.target.value
                    )
                  }

                  onKeyDown={
                    handleStaffKeyDown
                  }

                  placeholder="VRChat表示名"

                  className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base outline-none focus:border-emerald-500 disabled:opacity-50"
                />


                <button
                  type="button"

                  disabled={
                    processing
                  }

                  onClick={
                    handleAddStaff
                  }

                  className="min-h-12 rounded-xl border border-emerald-700 px-5 py-3 font-semibold text-emerald-400 transition hover:bg-emerald-950 disabled:opacity-40"
                >
                  ＋ 追加
                </button>

              </div>

            </div>


            {/* 配信 */}

            <div className="border-t border-slate-800 pt-6">

              <h2 className="text-lg font-bold">
                ライブ配信
              </h2>


              <input
                type="url"

                value={
                  streamUrl
                }

                disabled={
                  processing
                }

                onChange={(e) =>
                  setStreamUrl(
                    e.target.value
                  )
                }

                placeholder="https://www.youtube.com/watch?v=..."

                className="mt-4 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base outline-none focus:border-blue-500 disabled:opacity-50"
              />

            </div>


            {/* 保存 */}

            <button
              type="button"

              onClick={
                handleSave
              }

              disabled={
                processing
              }

              className="min-h-12 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {saving
                ? "保存中..."
                : "変更を保存"}

            </button>

          </section>


          {/* ==================================================
              右側：公開・販売状態
          ================================================== */}

          <aside className="h-fit space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:space-y-6 sm:p-6">


            {/* Market ID */}

            <div>

              <p className="text-sm text-slate-400">
                Market ID
              </p>


              <p className="mt-1 break-all font-mono text-base font-bold text-emerald-400 sm:text-lg">
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
                  className={`h-2.5 w-2.5 rounded-full ${
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


            {/* ==================================================
                販売状態
            ================================================== */}

            <div className="border-t border-slate-800" />


            <div>

              <p className="text-sm text-slate-400">
                販売状態
              </p>


              <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950 p-4">


                {/* READY */}

                {saleStatus ===
                  "READY" && (

                  <div>

                    <div className="flex items-center gap-2">

                      <span className="h-3 w-3 rounded-full bg-slate-500" />


                      <p className="font-bold text-slate-200">
                        販売前
                      </p>

                    </div>


                    <p className="mt-2 text-sm text-slate-500">
                      商品の販売はまだ開始されていません。
                    </p>

                  </div>

                )}


                {/* LIVE */}

                {saleStatus ===
                  "LIVE" && (

                  <div>

                    <div className="flex items-center gap-2">

                      <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-400" />


                      <p className="font-bold text-emerald-400">
                        販売中
                      </p>

                    </div>


                    <p className="mt-2 text-sm text-slate-400">
                      現在、この販売会は販売中です。
                    </p>

                  </div>

                )}


                {/* ENDED */}

                {saleStatus ===
                  "ENDED" && (

                  <div>

                    <div className="flex items-center gap-2">

                      <span className="h-3 w-3 rounded-full bg-amber-400" />


                      <p className="font-bold text-amber-300">
                        販売終了
                      </p>

                    </div>


                    <p className="mt-2 text-sm text-slate-500">
                      この販売会は終了しています。
                    </p>

                  </div>

                )}

              </div>


              {/* 販売開始 */}

              {(saleStatus ===
                "READY" ||
                saleStatus ===
                  "ENDED") && (

                <button
                  type="button"

                  onClick={() =>
                    handleChangeSaleStatus(
                      "LIVE"
                    )
                  }

                  disabled={
                    processing ||
                    reorderingProducts ||
                    market.status !==
                      "published"
                  }

                  className="mt-3 min-h-12 w-full rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                >

                  {changingSaleStatus
                    ? "変更中..."
                    : saleStatus ===
                        "ENDED"
                      ? "▶ もう一度販売開始"
                      : "▶ 販売開始"}

                </button>

              )}

{/* 販売前に戻す */}

{saleStatus ===
  "ENDED" && (

  <button
    type="button"

    onClick={() => {
      const confirmed =
        window.confirm(
          [
            "販売状態を「販売前」に戻しますか？",
            "",
            "VRChat側には",
            "「まもなく販売開始」",
            "と表示されます。",
          ].join(
            "\n"
          )
        );

      if (
        !confirmed
      ) {
        return;
      }

      handleChangeSaleStatus(
        "READY"
      );
    }}

    disabled={
      processing ||
      reorderingProducts
    }

    className="mt-3 min-h-12 w-full rounded-xl border border-slate-600 bg-slate-800 px-5 py-3 font-bold text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
  >

    {changingSaleStatus
      ? "変更中..."
      : "↩ 販売前に戻す"}

  </button>

)}

              {/* 販売終了 */}

              {saleStatus ===
                "LIVE" && (

                <button
                  type="button"

                  onClick={() =>
                    handleChangeSaleStatus(
                      "ENDED"
                    )
                  }

                  disabled={
                    processing ||
                    reorderingProducts
                  }

                  className="mt-3 min-h-12 w-full rounded-xl border border-red-700 bg-red-950/40 px-5 py-3 font-bold text-red-300 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-40"
                >

                  {changingSaleStatus
                    ? "変更中..."
                    : "■ 販売終了"}

                </button>

              )}


              {/* 未公開時の案内 */}

              {market.status !==
                "published" &&
                saleStatus !==
                  "LIVE" && (

                <p className="mt-2 text-xs leading-relaxed text-amber-400">
                  販売を開始するには、先に販売会を公開してください。
                </p>

              )}

            </div>


            {/* ==================================================
                公開操作
            ================================================== */}

            <div className="border-t border-slate-800" />


            <button
              type="button"

              onClick={
                handlePublish
              }

              disabled={
                processing ||
                products.length ===
                  0 ||
                reorderingProducts
              }

              className="min-h-12 w-full rounded-xl bg-blue-500 px-5 py-3 font-bold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
            >

              {publishing
                ? "公開処理中..."
                : market.status ===
                    "published"
                  ? "↻ 再公開する"
                  : "🚀 販売会を公開"}

            </button>


            {market.status ===
              "published" && (

              <button
                type="button"

                onClick={
                  handleUnpublish
                }

                disabled={
                  processing ||
                  reorderingProducts
                }

                className="min-h-12 w-full rounded-xl border border-amber-700 bg-amber-950/30 px-5 py-3 font-bold text-amber-300 transition hover:bg-amber-950 disabled:opacity-40"
              >
                公開を解除する
              </button>

            )}

          </aside>

        </div>


        {/* ==================================================
            商品
        ================================================== */}

        <section className="mt-10 sm:mt-12">


          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">


            <div>

              <h2 className="text-2xl font-bold">
                商品
              </h2>


              <p className="mt-1 text-sm text-slate-400">
                商品の並び替え・編集・削除ができます。
              </p>


              <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                ⋮⋮ をドラッグして表示順を変更できます。
              </p>


              <p className="mt-1 text-xs text-slate-500 sm:hidden">
                ↑ ↓ ボタンで表示順を変更できます。
              </p>

            </div>


            <Link
              href={`/markets/${marketUuid}/products/new`}

              className="flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 sm:w-auto"
            >
              ＋ 商品を追加
            </Link>

          </div>


          {reorderingProducts && (

            <div className="mb-4 rounded-xl border border-blue-800 bg-blue-950/30 p-3 text-sm text-blue-300">
              並び替えを保存中...
            </div>

          )}


          {productOrderChanged && (

            <div className="mb-5 rounded-xl border border-amber-800 bg-amber-950/30 p-4">

              <p className="text-sm font-medium text-amber-300">

                {market.status ===
                "published"
                  ? "商品順を変更しました。VRChatへ反映するには「再公開する」を押してください。"
                  : "商品順を変更しました。次回公開するとこの順番が反映されます。"}

              </p>

            </div>

          )}


          {products.length ===
          0 ? (

            <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-500 sm:p-10">
              まだ商品がありません。
            </div>

          ) : (

            <div className="space-y-4">

              {products.map(
                (
                  product,
                  index
                ) => {

                  const isDragging =
                    draggingProductId ===
                    product.id;


                  const isDragOver =
                    dragOverProductId ===
                    product.id;


                  const isDeleting =
                    deletingProductId ===
                    product.id;


                  return (

                    <div
                      key={
                        product.id
                      }

                      onDragOver={
                        handleDragOver
                      }

                      onDragEnter={() =>
                        handleDragEnter(
                          product.id
                        )
                      }

                      onDrop={
                        handleDrop
                      }

                      className={`rounded-2xl border bg-slate-900 p-4 transition sm:p-6 ${
                        isDragOver
                          ? "border-emerald-400"
                          : "border-slate-800"
                      } ${
                        isDragging
                          ? "opacity-50"
                          : ""
                      }`}
                    >


                      {/* PC用ドラッグ */}

                      <div
                        draggable={
                          !reorderingProducts
                        }

                        onDragStart={(event) =>
                          handleDragStart(
                            event,
                            product.id
                          )
                        }

                        onDragEnd={
                          handleDragEnd
                        }

                        className={`mb-4 hidden select-none rounded-lg border border-dashed px-4 py-2 text-center text-sm transition sm:block ${
                          reorderingProducts
                            ? "cursor-wait border-slate-800 text-slate-700"
                            : "cursor-grab border-slate-700 text-slate-500 hover:border-emerald-600 hover:text-emerald-400 active:cursor-grabbing"
                        }`}
                      >
                        ⋮⋮ ドラッグして並び替え
                      </div>


                      {/* スマホ用 ↑ ↓ */}

                      <div className="mb-4 grid grid-cols-2 gap-2 sm:hidden">

                        <button
                          type="button"

                          onClick={() =>
                            handleMoveProduct(
                              product.id,
                              "up"
                            )
                          }

                          disabled={
                            index ===
                              0 ||
                            reorderingProducts ||
                            processing
                          }

                          className="min-h-12 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 font-semibold text-slate-200 transition active:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ↑ 上へ
                        </button>


                        <button
                          type="button"

                          onClick={() =>
                            handleMoveProduct(
                              product.id,
                              "down"
                            )
                          }

                          disabled={
                            index ===
                              products.length -
                                1 ||
                            reorderingProducts ||
                            processing
                          }

                          className="min-h-12 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 font-semibold text-slate-200 transition active:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ↓ 下へ
                        </button>

                      </div>


                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">


                        {/* 商品情報 */}

                        <div className="min-w-0 flex-1">


                          <div className="flex flex-wrap items-center justify-between gap-2 sm:block">

                            <p className="text-sm text-slate-500">
                              No.
                              {String(
                                index +
                                  1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </p>


                            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs sm:hidden">
                              {product.initial_state}
                            </span>

                          </div>


                          <h3 className="mt-2 break-words text-lg font-bold sm:mt-1 sm:text-xl">
                            {product.name}
                          </h3>


                          <p className="mt-2 text-lg font-semibold text-emerald-400">
                            ¥
                            {product.price.toLocaleString()}
                          </p>


                          {product.description && (

                            <p className="mt-2 break-words text-sm leading-relaxed text-slate-400">
                              {product.description}
                            </p>

                          )}

                        </div>


                        {/* 操作 */}

                        <div className="w-full space-y-3 sm:w-52">


                          <div className="hidden justify-end sm:flex">

                            <span className="rounded-full border border-slate-700 px-3 py-1 text-sm">
                              {product.initial_state}
                            </span>

                          </div>


                          <Link
                            href={`/markets/${marketUuid}/products/${product.id}`}

                            className="flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-700 px-4 py-3 font-medium transition hover:bg-slate-800 active:bg-slate-800"
                          >
                            編集
                          </Link>


                          <button
                            type="button"

                            onClick={() =>
                              handleDeleteProduct(
                                product
                              )
                            }

                            disabled={
                              isDeleting ||
                              reorderingProducts
                            }

                            className="min-h-12 w-full rounded-xl border border-red-900 px-4 py-3 font-medium text-red-400 transition hover:bg-red-950 active:bg-red-950 disabled:cursor-not-allowed disabled:opacity-40"
                          >

                            {isDeleting
                              ? "削除中..."
                              : "削除"}

                          </button>

                        </div>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>


        {/* ==================================================
            販売会削除
        ================================================== */}

        <section className="mt-10 rounded-2xl border border-red-900/70 bg-red-950/20 p-5 sm:mt-12 sm:p-6">

          <h2 className="text-lg font-bold text-red-300">
            危険な操作
          </h2>


          <p className="mt-2 text-sm text-slate-400">
            販売会を削除すると、商品・商品写真もすべて削除されます。
          </p>


          <p className="mt-1 text-sm font-medium text-red-400">
            この操作は元に戻せません。
          </p>


          <button
            type="button"

            onClick={
              handleDeleteMarket
            }

            disabled={
              processing ||
              reorderingProducts
            }

            className="mt-5 min-h-12 w-full rounded-xl border border-red-700 bg-red-950 px-5 py-3 font-bold text-red-300 transition hover:bg-red-900 disabled:opacity-50 sm:w-auto"
          >

            {deletingMarket
              ? "販売会を削除中..."
              : "販売会を削除"}

          </button>

        </section>

      </div>

    </main>
  );
}