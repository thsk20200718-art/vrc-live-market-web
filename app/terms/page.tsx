import Link from "next/link";

export default function TermsPage() {
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
            利用規約
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            最終更新：2026年9月19日
          </p>
        </header>

        <div className="mt-10 space-y-10 leading-relaxed text-slate-300">

          <section>
            <h2 className="text-xl font-bold text-white">
              第1条（適用）
            </h2>

            <p className="mt-4">
              本利用規約（以下「本規約」といいます。）は、
              VRC Live Market（以下「本サービス」といいます。）の
              利用条件を定めるものです。
            </p>

            <p className="mt-3">
              本サービスを利用する販売者、スタッフその他の利用者は、
              本規約に同意した上で本サービスを利用するものとします。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              第2条（本サービスの内容）
            </h2>

            <p className="mt-4">
              本サービスは、VRChat上で行われる商品紹介、
              ライブ販売イベントその他これらに関連する活動を
              補助するためのシステムです。
            </p>

            <p className="mt-3">
              本サービスでは、商品情報、価格、画像、
              AVAILABLE、HOLD、SOLD等の状態表示、
              配信映像その他販売イベントに必要な情報を
              VRChat上に表示する機能を提供します。
            </p>

            <p className="mt-3">
              本サービス自体は商品の販売、決済、
              配送その他の売買取引を行うものではありません。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              第3条（売買契約）
            </h2>

            <p className="mt-4">
              商品の売買契約は、販売者と購入者との間で
              直接成立するものとします。
            </p>

            <p className="mt-3">
              VRChat上または本サービス上に表示される
              AVAILABLE、HOLD、SOLDその他の状態は、
              販売進行および在庫状況を補助的に表示するものであり、
              それ自体によって売買契約の成立を意味するものではありません。
            </p>

            <p className="mt-3 font-semibold text-amber-300">
              特に、HOLD表示は購入確定または売買契約成立を意味しません。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              第4条（販売者の責任）
            </h2>

            <p className="mt-4">
              販売者は、自ら取り扱う商品について、
              適用される法令および規則を遵守する責任を負います。
            </p>

            <p className="mt-3">
              販売者は、商品の内容、品質、価格、在庫、
              送料、支払方法、発送時期、返品、交換、
              キャンセル、返金その他の取引条件について、
              購入者に正確な情報を提供するものとします。
            </p>

            <p className="mt-3">
              販売者は、必要に応じて特定商取引法その他の法令に基づく
              表示を、自ら使用するECサイトその他の販売ページに
              掲載するものとします。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              第5条（外部サービス）
            </h2>

            <p className="mt-4">
              注文、決済、購入者情報の入力、配送手続等は、
              販売者が指定する外部ECサイトその他のサービスを
              使用して行うものとします。
            </p>

            <p className="mt-3">
              外部サービスの利用については、
              当該サービスの利用規約および
              プライバシーポリシーが適用されます。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              第6条（VRChatの利用）
            </h2>

            <p className="mt-4">
              利用者は、VRChatを利用する場合、
              VRChatのTerms of Service、
              Community Guidelines、
              Creator Guidelinesその他の適用されるルールを
              遵守するものとします。
            </p>

            <p className="mt-3">
              VRChatの規約変更その他の事情により、
              本サービスの全部または一部の機能、
              運用方法または利用条件を変更する場合があります。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              第7条（禁止事項）
            </h2>

            <p className="mt-4">
              利用者は、本サービスの利用にあたり、
              次の行為を行ってはなりません。
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>
                法令または公序良俗に違反する行為
              </li>

              <li>
                VRChatその他の関連サービスの規約に違反する行為
              </li>

              <li>
                違法な商品またはサービスを販売する行為
              </li>

              <li>
                偽造品、盗品その他権利を有しない商品を販売する行為
              </li>

              <li>
                第三者の著作権、商標権その他の権利を侵害する行為
              </li>

              <li>
                商品の内容、品質、効果、価格または在庫等について
                虚偽または誤解を招く表示を行う行為
              </li>

              <li>
                他人になりすます行為
              </li>

              <li>
                本サービスのシステムに不正アクセスする行為
              </li>

              <li>
                本サービスの正常な運営を妨害する行為
              </li>

              <li>
                その他、運営者が不適切と判断する行為
              </li>
            </ul>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              第8条（利用停止）
            </h2>

            <p className="mt-4">
              運営者は、利用者が本規約に違反した場合、
              または本サービスの安全な運営のため必要と判断した場合、
              事前の通知なく本サービスの利用を制限または停止できるものとします。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              第9条（サービスの変更・停止）
            </h2>

            <p className="mt-4">
              運営者は、システム保守、障害、外部サービスの変更、
              VRChatの仕様変更その他必要な事情がある場合、
              本サービスの全部または一部を変更または停止することがあります。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              第10条（免責）
            </h2>

            <p className="mt-4">
              運営者は、販売者と購入者との間で発生した
              商品の品質、代金、配送、返品、返金その他の
              売買取引上の問題について、
              法令上運営者が責任を負う場合を除き、
              当事者間で解決するものとします。
            </p>

            <p className="mt-3">
              また、VRChat、外部ECサイト、通信サービスその他
              第三者が提供するサービスの障害または仕様変更等によって
              生じた損害についても、
              運営者に故意または過失がある場合その他
              法令上責任を負う場合を除き、
              責任を負わないものとします。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              第11条（知的財産権）
            </h2>

            <p className="mt-4">
              利用者が本サービスへ登録する画像、
              商品説明その他のコンテンツについて、
              利用者は必要な権利または許諾を有しているものとします。
            </p>

            <p className="mt-3">
              本サービスそのものに関するプログラム、
              デザインその他の権利は、
              運営者または正当な権利者に帰属します。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              第12条（規約の変更）
            </h2>

            <p className="mt-4">
              運営者は、法令の変更、サービス内容の変更その他
              必要がある場合、本規約を変更することがあります。
            </p>

            <p className="mt-3">
              重要な変更がある場合は、
              本サービス上その他適切な方法で利用者へ通知します。
            </p>
          </section>


          <section>
            <h2 className="text-xl font-bold text-white">
              第13条（準拠法）
            </h2>

            <p className="mt-4">
              本規約は日本法を準拠法とします。
            </p>
          </section>


          <section className="rounded-2xl border border-amber-900 bg-amber-950/20 p-5">
            <p className="font-bold text-amber-300">
              Beta版について
            </p>

            <p className="mt-2 text-sm text-slate-400">
              VRC Live Marketは現在開発中のBetaサービスです。
              正式公開までに機能および利用条件が変更される場合があります。
            </p>
          </section>


          <section className="border-t border-slate-800 pt-8">
            <p className="text-sm text-slate-500">
              VRC Live Marketは独立して開発されているプロジェクトであり、
              VRChat Inc.の公式サービスではありません。
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}