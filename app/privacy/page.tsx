import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">

        <Link
          href="/"
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← UruBoothへ戻る
        </Link>

        <header className="mt-8">
          <p className="text-sm font-semibold tracking-[0.2em] text-emerald-400">
            UruBooth
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            プライバシーポリシー
          </h1>

          <p className="mt-4 text-sm text-slate-400">
            最終更新：2026年9月19日
          </p>
        </header>


        <div className="mt-10 space-y-10 leading-relaxed text-slate-300">

          <section>
            <h2 className="text-xl font-bold text-white">
              1. 基本方針
            </h2>

            <p className="mt-4">
              UruBoothは、
              利用者の情報を適切に取り扱い、
              本サービスの提供に必要な範囲で利用します。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              2. 取得する情報
            </h2>

            <p className="mt-4">
              本サービスでは、次の情報を取得する場合があります。
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>アカウント登録に使用するメールアドレス</li>
              <li>ユーザーを識別するためのID</li>
              <li>VRChat Display Name</li>
              <li>販売会名</li>
              <li>商品情報</li>
              <li>商品画像</li>
              <li>価格・商品説明</li>
              <li>配信URL</li>
              <li>サービス利用に伴う技術的情報</li>
            </ul>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              3. 利用目的
            </h2>

            <p className="mt-4">
              取得した情報は次の目的で使用します。
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>本サービスの提供</li>
              <li>本人確認およびログイン機能の提供</li>
              <li>販売会および商品情報の管理</li>
              <li>VRChatへの情報表示</li>
              <li>障害・不具合への対応</li>
              <li>本サービスの改善</li>
              <li>不正利用への対応</li>
              <li>利用者からの問い合わせへの対応</li>
            </ul>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              4. 購入者の決済・配送情報について
            </h2>

            <p className="mt-4 font-semibold text-emerald-300">
              UruBoothでは、
              購入者のクレジットカード番号等の決済情報を
              直接取得・保存しません。
            </p>

            <p className="mt-3">
              また、本サービスのVRChatシステム内で
              購入者の住所や電話番号等の配送情報を
              収集することを想定していません。
            </p>

            <p className="mt-3">
              注文、決済および配送先情報の入力には、
              販売者が指定する外部ECサイトまたは
              決済サービスを使用します。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              5. 外部サービス
            </h2>

            <p className="mt-4">
              本サービスでは、認証、データ保存、
              Webサイト配信その他の目的で、
              外部サービスを利用する場合があります。
            </p>

            <p className="mt-3">
              各外部サービスにおける情報の取扱いについては、
              各サービス提供者のプライバシーポリシー等が
              適用される場合があります。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              6. 第三者への提供
            </h2>

            <p className="mt-4">
              法令に基づく場合その他正当な理由がある場合を除き、
              本人の同意なく個人情報を第三者へ提供しません。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              7. 安全管理
            </h2>

            <p className="mt-4">
              本サービスは、取得した情報の漏えい、
              滅失または毀損の防止その他必要な安全管理に努めます。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              8. 情報の削除等
            </h2>

            <p className="mt-4">
              利用者本人から、自身の情報について
              確認、訂正または削除等の申し出があった場合、
              法令および本サービスの運用上必要な範囲で対応します。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              9. ポリシーの変更
            </h2>

            <p className="mt-4">
              法令またはサービス内容の変更等に応じて、
              本ポリシーを変更する場合があります。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              10. お問い合わせ
            </h2>

            <p className="mt-4">
              本サービスにおける情報の取扱いに関するお問い合わせ先は、
              正式公開までに本ページ上へ掲載します。
            </p>
          </section>


          <section className="border-t border-slate-800 pt-8">
            <p className="text-sm text-slate-500">
              UruBoothは独立して開発されているプロジェクトであり、
              VRChat Inc.の公式サービスではありません。
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}