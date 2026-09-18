import Link from "next/link";

export default function GuidelinesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">

        <Link
          href="/"
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← VRC Live Marketへ戻る
        </Link>

        <header className="mt-8">
          <p className="text-sm font-semibold tracking-[0.2em] text-emerald-400">
            VRC LIVE MARKET
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            禁止商品・利用上の注意
          </h1>

          <p className="mt-4 leading-relaxed text-slate-400">
            安全にライブ販売を行うため、
            VRC Live Marketでは以下の商品および利用方法を禁止しています。
          </p>
        </header>


        <div className="mt-10 space-y-8">

          <section className="rounded-2xl border border-red-900 bg-red-950/20 p-5 sm:p-6">
            <h2 className="text-xl font-bold text-red-300">
              販売禁止
            </h2>

            <ul className="mt-4 list-disc space-y-3 pl-6 text-slate-300">
              <li>法令により販売が禁止されている商品</li>
              <li>違法薬物その他の違法物品</li>
              <li>盗品または不正に取得された商品</li>
              <li>偽造品・模倣品</li>
              <li>第三者の知的財産権を侵害する商品</li>
              <li>危険物、爆発物その他安全上問題のある商品</li>
              <li>法令上必要な許可なく販売される規制対象商品</li>
              <li>成人向けまたは性的な商品・コンテンツ</li>
              <li>VRChatの規約に違反する商品・コンテンツ</li>
              <li>その他、運営者が不適切と判断する商品</li>
            </ul>
          </section>


          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <h2 className="text-xl font-bold">
              鉱物・天然石について
            </h2>

            <p className="mt-4 leading-relaxed text-slate-300">
              鉱物、天然石、化石等を販売する場合、
              採集・所有・輸出入・販売に関する法令や
              原産国・地域の規制を確認してください。
            </p>

            <p className="mt-3 leading-relaxed text-slate-300">
              放射性物質、有害物質その他
              人体または環境へ危険を及ぼす可能性がある商品については、
              本サービス上での販売を行わないでください。
            </p>
          </section>


          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <h2 className="text-xl font-bold">
              商品説明
            </h2>

            <p className="mt-4 leading-relaxed text-slate-300">
              商品の種類、状態、傷、サイズ、加工の有無など、
              購入判断に重要な情報を正確に説明してください。
            </p>

            <p className="mt-3 leading-relaxed text-slate-300">
              科学的・医学的な効果について、
              十分な根拠がない効能を断定する表示は行わないでください。
            </p>
          </section>


          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <h2 className="text-xl font-bold">
              HOLDについて
            </h2>

            <p className="mt-4 leading-relaxed text-slate-300">
              HOLDは販売進行上の一時的な取り置き表示です。
            </p>

            <p className="mt-3 font-semibold text-amber-300">
              HOLDのみで購入確定または売買契約成立とはなりません。
            </p>

            <p className="mt-3 leading-relaxed text-slate-300">
              最終的な注文・決済・契約成立については、
              販売者が指定する外部販売ページの手続に従ってください。
            </p>
          </section>


          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <h2 className="text-xl font-bold">
              個人情報
            </h2>

            <p className="mt-4 leading-relaxed text-slate-300">
              VRChat上で購入者の住所、電話番号、
              クレジットカード情報その他の
              秘密性の高い情報を聞き出さないでください。
            </p>

            <p className="mt-3 leading-relaxed text-slate-300">
              配送先情報および決済情報は、
              適切な外部EC・決済サービスを使用して取得してください。
            </p>
          </section>


          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <h2 className="text-xl font-bold">
              VRChatでの行動
            </h2>

            <p className="mt-4 leading-relaxed text-slate-300">
              販売者およびスタッフは、
              VRChatのTerms of Service、
              Community Guidelines、
              Creator Guidelinesその他適用されるルールを
              遵守してください。
            </p>
          </section>


          <section className="rounded-2xl border border-emerald-900 bg-emerald-950/20 p-5 sm:p-6">
            <h2 className="font-bold text-emerald-300">
              判断に迷った場合
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              販売してよいか判断できない商品については、
              販売会を開始する前にVRC Live Market運営へ確認してください。
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}