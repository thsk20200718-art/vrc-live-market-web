import Link from "next/link";

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">


        {/* ====================================================
            戻る
        ==================================================== */}

        <Link
          href="/"
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← 販売会管理へ戻る
        </Link>


        {/* ====================================================
            Header
        ==================================================== */}

        <header className="mt-8">

          <p className="text-sm font-semibold tracking-[0.2em] text-emerald-400">
            VRC LIVE MARKET
          </p>


          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            はじめての方へ
          </h1>


          <p className="mt-4 max-w-2xl leading-relaxed text-slate-400">
            VRC Live Marketを使って、
            VRChat上でライブ販売を始めるまでの流れを紹介します。
          </p>

        </header>


        {/* ====================================================
            全体の流れ
        ==================================================== */}

        <section className="mt-10 rounded-2xl border border-emerald-900 bg-emerald-950/20 p-5 sm:p-6">

          <p className="text-sm font-semibold text-emerald-300">
            販売開始までの流れ
          </p>


          <div className="mt-5 grid gap-3 sm:grid-cols-5">

            <div className="rounded-xl bg-slate-900 p-4 text-center">
              <p className="text-sm text-slate-500">
                STEP 1
              </p>

              <p className="mt-1 font-semibold">
                販売会作成
              </p>
            </div>


            <div className="rounded-xl bg-slate-900 p-4 text-center">
              <p className="text-sm text-slate-500">
                STEP 2
              </p>

              <p className="mt-1 font-semibold">
                商品登録
              </p>
            </div>


            <div className="rounded-xl bg-slate-900 p-4 text-center">
              <p className="text-sm text-slate-500">
                STEP 3
              </p>

              <p className="mt-1 font-semibold">
                公開
              </p>
            </div>


            <div className="rounded-xl bg-slate-900 p-4 text-center">
              <p className="text-sm text-slate-500">
                STEP 4
              </p>

              <p className="mt-1 font-semibold">
                VRChat確認
              </p>
            </div>


            <div className="rounded-xl bg-slate-900 p-4 text-center">
              <p className="text-sm text-slate-500">
                STEP 5
              </p>

              <p className="mt-1 font-semibold">
                販売開始
              </p>
            </div>

          </div>

        </section>


        {/* ====================================================
            STEP 1
        ==================================================== */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">

          <div className="flex items-center gap-3">

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-bold text-slate-950">
              1
            </span>


            <h2 className="text-xl font-bold">
              販売会を作成
            </h2>

          </div>


          <p className="mt-5 leading-relaxed text-slate-300">
            ダッシュボードの
            「新しい販売会を作る」から販売会を作成します。
          </p>


          <div className="mt-4 rounded-xl bg-slate-950 p-4">

            <p className="text-sm font-semibold">
              主に設定するもの
            </p>


            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-400">
              <li>販売会名</li>
              <li>VRChatの販売者Display Name</li>
              <li>スタッフのDisplay Name</li>
              <li>ライブ配信URL</li>
            </ul>

          </div>

        </section>


        {/* ====================================================
            STEP 2
        ==================================================== */}

        <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">

          <div className="flex items-center gap-3">

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-bold text-slate-950">
              2
            </span>


            <h2 className="text-xl font-bold">
              商品を登録
            </h2>

          </div>


          <p className="mt-5 leading-relaxed text-slate-300">
            販売する商品を登録します。
          </p>


          <div className="mt-4 rounded-xl bg-slate-950 p-4">

            <p className="text-sm font-semibold">
              商品に登録できる情報
            </p>


            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-400">
              <li>商品名</li>
              <li>価格</li>
              <li>説明</li>
              <li>商品写真</li>
              <li>初期状態</li>
            </ul>

          </div>


          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            商品はあとから編集・削除・並び替えできます。
          </p>

        </section>


        {/* ====================================================
            STEP 3
        ==================================================== */}

        <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">

          <div className="flex items-center gap-3">

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-bold text-slate-950">
              3
            </span>


            <h2 className="text-xl font-bold">
              販売会を公開
            </h2>

          </div>


          <p className="mt-5 leading-relaxed text-slate-300">
            商品登録が終わったら、
            販売会管理画面の「販売会を公開」を押します。
          </p>


          <p className="mt-3 leading-relaxed text-slate-400">
            公開すると、
            VRChatから販売会の商品情報を読み込める状態になります。
          </p>


          <div className="mt-4 rounded-xl border border-amber-900 bg-amber-950/20 p-4">

            <p className="text-sm font-semibold text-amber-300">
              公開＝販売開始ではありません
            </p>


            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              「公開中」でも販売状態が「販売前」であれば、
              まだライブ販売は開始されません。
            </p>

          </div>

        </section>


        {/* ====================================================
            STEP 4
        ==================================================== */}

        <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">

          <div className="flex items-center gap-3">

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-bold text-slate-950">
              4
            </span>


            <h2 className="text-xl font-bold">
              VRChatで確認
            </h2>

          </div>


          <p className="mt-5 leading-relaxed text-slate-300">
            VRC Live Market対応ワールドへ入り、
            商品情報が正しく表示されているか確認します。
          </p>


          <div className="mt-4 rounded-xl bg-slate-950 p-4">

            <p className="text-sm font-semibold">
              確認ポイント
            </p>


            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-400">
              <li>販売会名</li>
              <li>商品名</li>
              <li>価格</li>
              <li>説明</li>
              <li>商品写真</li>
              <li>販売者・スタッフの操作パネル</li>
            </ul>

          </div>


          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            販売前はライブ配信は再生されず、
            購入者側には販売開始前の案内が表示されます。
          </p>

        </section>


        {/* ====================================================
            STEP 5
        ==================================================== */}

        <section className="mt-5 rounded-2xl border border-emerald-900 bg-emerald-950/20 p-5 sm:p-7">

          <div className="flex items-center gap-3">

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-bold text-slate-950">
              5
            </span>


            <h2 className="text-xl font-bold">
              販売開始
            </h2>

          </div>


          <p className="mt-5 leading-relaxed text-slate-300">
            準備ができたら、
            Web管理画面から「販売開始」を押します。
          </p>


          <div className="mt-4 space-y-3">

            <div className="rounded-xl bg-slate-950 p-4">

              <p className="font-semibold text-emerald-400">
                READY → LIVE
              </p>


              <p className="mt-2 text-sm text-slate-400">
                VRChat側も自動で販売中へ切り替わります。
              </p>

            </div>


            <div className="rounded-xl bg-slate-950 p-4">

              <p className="font-semibold">
                配信開始
              </p>


              <p className="mt-2 text-sm text-slate-400">
                販売中になるとライブ配信が自動で再生されます。
              </p>

            </div>


            <div className="rounded-xl bg-slate-950 p-4">

              <p className="font-semibold">
                商品状態を操作
              </p>


              <p className="mt-2 text-sm text-slate-400">
                販売中のみAVAILABLE・HOLD・SOLDを操作できます。
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            販売終了
        ==================================================== */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">

          <h2 className="text-xl font-bold">
            販売会が終わったら
          </h2>


          <p className="mt-4 leading-relaxed text-slate-300">
            Web管理画面の「販売終了」を押します。
          </p>


          <div className="mt-4 rounded-xl bg-slate-950 p-4">

            <p className="font-semibold text-amber-300">
              LIVE → ENDED
            </p>


            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              VRChat側には販売終了の案内が表示され、
              ライブ配信も停止します。
            </p>

          </div>


          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            同じ販売会を再利用する場合は、
            「販売前に戻す」を押して次回の販売に備えることができます。
          </p>

        </section>


        {/* ====================================================
            HOLD説明
        ==================================================== */}

        <section className="mt-8 rounded-2xl border border-amber-900 bg-amber-950/20 p-5 sm:p-6">

          <h2 className="font-bold text-amber-300">
            HOLDについて
          </h2>


          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            HOLDはライブ販売中の一時的な取り置き表示です。
          </p>


          <p className="mt-2 text-sm font-semibold text-amber-300">
            HOLDだけでは購入確定・売買契約成立にはなりません。
          </p>


          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            実際の注文・決済は販売者が指定する外部販売ページで行ってください。
          </p>

        </section>


        {/* ====================================================
            Legal
        ==================================================== */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">

          <h2 className="font-bold">
            利用前に確認してください
          </h2>


          <div className="mt-4 flex flex-col gap-3 text-sm">

            <Link
              href="/terms"
              className="text-emerald-400 transition hover:text-emerald-300"
            >
              利用規約 →
            </Link>


            <Link
              href="/privacy"
              className="text-emerald-400 transition hover:text-emerald-300"
            >
              プライバシーポリシー →
            </Link>


            <Link
              href="/guidelines"
              className="text-emerald-400 transition hover:text-emerald-300"
            >
              禁止商品・利用上の注意 →
            </Link>

          </div>

        </section>


        {/* ====================================================
            開始ボタン
        ==================================================== */}

        <div className="mt-10">

          <Link
            href="/"

            className="flex min-h-14 w-full items-center justify-center rounded-xl bg-emerald-500 px-6 py-4 text-lg font-bold text-slate-950 transition hover:bg-emerald-400 sm:w-auto"
          >
            販売会管理へ進む
          </Link>

        </div>


        {/* ====================================================
            Footer
        ==================================================== */}

        <p className="mt-10 border-t border-slate-800 pt-6 text-xs leading-relaxed text-slate-600">
          VRC Live MarketはVRChat Inc.とは独立して開発されており、
          VRChat Inc.の公式サービスではありません。
        </p>

      </div>

    </main>
  );
}