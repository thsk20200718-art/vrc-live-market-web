import Link from "next/link";


// ============================================================
// 共通ステップ
// ============================================================

type GuideStepProps = {
  number: string;
  title: string;
  children: React.ReactNode;
};


function GuideStep({
  number,
  title,
  children,
}: GuideStepProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">

      <div className="flex items-start gap-4">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-bold text-slate-950">
          {number}
        </div>


        <div className="min-w-0">

          <h2 className="text-xl font-bold text-white">
            {title}
          </h2>


          <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-400">
            {children}
          </div>

        </div>

      </div>

    </section>
  );
}


// ============================================================
// ページ
// ============================================================

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">


        {/* ====================================================
            Header
        ==================================================== */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <p className="text-sm font-semibold tracking-[0.25em] text-emerald-400">
              UruBooth
            </p>


            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              はじめての使い方
            </h1>


            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
              UruBoothでは、
              Web画面で販売会や商品を登録し、
              VRChat上で商品紹介・HOLD・SOLD管理を行えます。
            </p>

          </div>


          <Link
            href="/"

            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            販売会管理へ
          </Link>

        </div>


        {/* ====================================================
            まず覚える3つ
        ==================================================== */}

        <section className="mt-8 rounded-2xl border border-emerald-900/60 bg-emerald-950/20 p-5 sm:p-6">

          <h2 className="text-lg font-bold text-emerald-300">
            まず覚える3つの状態
          </h2>


          <div className="mt-5 grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

              <p className="font-bold text-slate-200">
                READY
              </p>

              <p className="mt-2 text-sm text-slate-400">
                販売前です。
                VRChatでは「まもなく販売開始」と表示されます。
              </p>

            </div>


            <div className="rounded-xl border border-emerald-900 bg-emerald-950/30 p-4">

              <p className="font-bold text-emerald-300">
                LIVE
              </p>

              <p className="mt-2 text-sm text-slate-400">
                販売中です。
                商品状態の変更や購入案内を行います。
              </p>

            </div>


            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

              <p className="font-bold text-slate-200">
                ENDED
              </p>

              <p className="mt-2 text-sm text-slate-400">
                販売終了です。
                VRChatでは販売終了案内が表示されます。
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            Steps
        ==================================================== */}

        <div className="mt-8 space-y-5">


          <GuideStep
            number="1"
            title="販売会を作る"
          >

            <p>
              販売会管理画面から
              「販売会を作成」を押します。
            </p>


            <p>
              販売会タイトル、
              VRChat上で操作する販売者名、
              必要に応じてスタッフ名や配信URLを設定します。
            </p>


            <div className="rounded-xl bg-slate-950 p-4">

              <p className="font-semibold text-slate-300">
                VRChat表示名について
              </p>

              <p className="mt-2">
                販売者・スタッフとして操作する人の
                VRChat Display Nameを正確に入力してください。
              </p>

            </div>

          </GuideStep>


          <GuideStep
            number="2"
            title="商品を登録する"
          >

            <p>
              作成した販売会を開き、
              商品を追加します。
            </p>


            <p>
              商品名、価格、説明、画像などを登録してください。
            </p>


            <p>
              商品画像は、
              公開時にVRChat向けの形式へ自動変換されます。
            </p>


            <div className="rounded-xl bg-slate-950 p-4">

              <p className="font-semibold text-slate-300">
                おすすめ
              </p>

              <p className="mt-2">
                実際の販売順に商品を並べておくと、
                VRChat内での進行がかなり楽になります。
              </p>

            </div>

          </GuideStep>


          <GuideStep
            number="3"
            title="販売会を公開する"
          >

            <p>
              商品登録が終わったら、
              販売会ページから「公開」を行います。
            </p>


            <p>
              公開すると、
              VRChatから読み込むためのデータが生成されます。
            </p>


            <div className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-4">

              <p className="font-semibold text-amber-300">
                公開前に確認
              </p>

              <p className="mt-2">
                商品名、価格、画像、販売者名、
                配信URLに間違いがないか確認してください。
              </p>

            </div>

          </GuideStep>


          <GuideStep
            number="4"
            title="VRChatで確認する"
          >

            <p>
              VRChatのUruBooth対応ワールドへ入り、
              登録した販売会が正しく表示されるか確認します。
            </p>


            <p>
              販売開始前は
              READY状態になっています。
            </p>


            <div className="rounded-xl bg-slate-950 p-4">

              <p className="font-semibold text-slate-300">
                確認するもの
              </p>

              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>販売会タイトル</li>
                <li>商品名</li>
                <li>価格</li>
                <li>商品画像</li>
                <li>商品順</li>
                <li>販売者として操作できるか</li>
              </ul>

            </div>

          </GuideStep>


          <GuideStep
            number="5"
            title="販売を開始する"
          >

            <p>
              Webの販売会画面から
              「販売開始」を押します。
            </p>


            <p>
              状態が
              READY → LIVE
              に切り替わり、
              VRChat側にも自動で反映されます。
            </p>


            <p>
              配信URLを登録している場合は、
              LIVE開始時にVRChat側の配信再生も開始されます。
            </p>

          </GuideStep>


          <GuideStep
            number="6"
            title="商品状態を管理する"
          >

            <p>
              販売中は、
              VRChatから商品の状態を変更できます。
            </p>


            <div className="grid gap-3 sm:grid-cols-3">

              <div className="rounded-xl bg-slate-950 p-4">

                <p className="font-bold text-emerald-300">
                  AVAILABLE
                </p>

                <p className="mt-2">
                  販売可能な状態です。
                </p>

              </div>


              <div className="rounded-xl bg-slate-950 p-4">

                <p className="font-bold text-amber-300">
                  HOLD
                </p>

                <p className="mt-2">
                  購入希望者がいる状態です。
                </p>

              </div>


              <div className="rounded-xl bg-slate-950 p-4">

                <p className="font-bold text-red-300">
                  SOLD
                </p>

                <p className="mt-2">
                  売約済みの状態です。
                </p>

              </div>

            </div>


            <div className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-4">

              <p className="font-semibold text-amber-300">
                HOLDについて
              </p>

              <p className="mt-2">
                HOLDは購入契約の成立を意味するものではありません。
                実際の注文・決済・配送は、
                販売者が案内する外部サービス等で行ってください。
              </p>

            </div>

          </GuideStep>


          <GuideStep
            number="7"
            title="販売を終了する"
          >

            <p>
              販売終了時は、
              Web画面から「販売終了」を押します。
            </p>


            <p>
              状態が
              LIVE → ENDED
              に変わり、
              VRChat側では販売終了案内が表示されます。
            </p>


            <p>
              配信も停止します。
            </p>


            <p>
              再度販売したい場合は、
              「もう一度販売開始」または
              「販売前に戻す」を利用してください。
            </p>

          </GuideStep>

        </div>


        {/* ====================================================
            販売前チェック
        ==================================================== */}

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">

          <h2 className="text-xl font-bold">
            販売開始前チェック
          </h2>


          <div className="mt-5 space-y-3 text-sm text-slate-400">

            <p>
              □ 商品情報に間違いがない
            </p>

            <p>
              □ 商品画像が表示されている
            </p>

            <p>
              □ 商品の順番が正しい
            </p>

            <p>
              □ VRChat上で販売者操作ができる
            </p>

            <p>
              □ 配信を使用する場合は映像が確認できる
            </p>

            <p>
              □ 注文・決済・配送方法を購入者へ案内できる
            </p>

          </div>

        </section>


        {/* ====================================================
            Trouble
        ==================================================== */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">

          <h2 className="text-xl font-bold">
            表示されない・更新されないとき
          </h2>


          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-400">

            <p>
              まず販売会が「公開済み」になっているか確認してください。
            </p>

            <p>
              VRChat側への反映には少し時間がかかる場合があります。
            </p>

            <p>
              VRChat上の商品情報がおかしい場合は、
              販売会ページの商品情報を確認してから再公開してください。
            </p>

            <p>
              状態変更ができない場合は、
              販売状態がLIVEになっているか確認してください。
            </p>

          </div>

        </section>


        {/* ====================================================
            Rules
        ==================================================== */}

        <section className="mt-8 rounded-2xl border border-amber-900/60 bg-amber-950/20 p-5 sm:p-7">

          <h2 className="text-lg font-bold text-amber-300">
            販売について
          </h2>


          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-400">

            <p>
              UruBoothは、
              商品紹介やライブ販売を支援するシステムです。
            </p>


            <p>
              商品の販売者、決済事業者、配送事業者ではありません。
            </p>


            <p>
              商品内容、価格、在庫、注文、決済、配送、
              返品・返金などについては販売者が管理してください。
            </p>

          </div>


          <div className="mt-5 flex flex-wrap gap-3">

            <Link
              href="/terms"

              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              利用規約
            </Link>


            <Link
              href="/guidelines"

              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              利用上の注意
            </Link>


            <Link
              href="/privacy"

              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              プライバシーポリシー
            </Link>

          </div>

        </section>


        {/* ====================================================
            Finish
        ==================================================== */}

        <section className="mt-10 rounded-2xl border border-emerald-900 bg-emerald-950/20 p-6 text-center sm:p-8">

          <p className="text-lg font-bold text-emerald-300">
            準備ができたら販売会を作ってみましょう
          </p>


          <p className="mt-3 text-sm text-slate-400">
            このガイドは後からいつでも確認できます。
          </p>


          <Link
            href="/"

            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-500 px-7 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            販売会管理へ進む
          </Link>

        </section>


        {/* ====================================================
            Footer
        ==================================================== */}

        <div className="mt-10 border-t border-slate-800 pt-6">

          <p className="text-center text-xs leading-relaxed text-slate-600">
            UruBoothはVRChat Inc.とは独立して開発されており、
            VRChat Inc.の公式サービスではありません。
          </p>

        </div>

      </div>

    </main>
  );
}