import Link from "next/link";

export default function GuidelinesPage() {
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
            禁止商品・利用上の注意
          </h1>

          <p className="mt-4 leading-relaxed text-slate-400">
            安全にライブ販売を行うため、
            UruBoothでは以下の商品および利用方法を禁止しています。
          </p>
        </header>


        <div className="mt-10 space-y-8">

          {/* ==================================================
              販売禁止
          ================================================== */}

          <section className="rounded-2xl border border-red-900 bg-red-950/20 p-5 sm:p-6">
            <h2 className="text-xl font-bold text-red-300">
              販売禁止
            </h2>

            <p className="mt-4 leading-relaxed text-slate-300">
              次の商品・コンテンツについては、
              UruBoothを利用した販売を行わないでください。
            </p>

            <ul className="mt-4 list-disc space-y-3 pl-6 text-slate-300">
              <li>
                法令により販売、所持、譲渡等が禁止されている商品
              </li>

              <li>
                違法薬物その他の違法な物品
              </li>

              <li>
                盗品または不正に取得された商品
              </li>

              <li>
                偽造品、模倣品その他第三者の権利を侵害する商品
              </li>

              <li>
                武器、危険物、爆発物その他安全上重大な危険を伴う商品
              </li>

              <li>
                必要な許可、届出、資格または年齢確認等を行わずに
                販売される規制対象商品
              </li>

              <li>
                医薬品その他、法令上販売方法が規制されている商品を
                必要な条件を満たさず販売する行為
              </li>

              <li>
                成人向けまたは性的な商品・コンテンツ
              </li>

              <li>
                犯罪、暴力その他の違法行為を助長する商品・コンテンツ
              </li>

              <li>
                第三者の著作権、商標権、肖像権その他の権利を
                侵害する商品・コンテンツ
              </li>

              <li>
                商品の内容、品質、効果、価格、出所等について
                虚偽または著しく誤解を招く表示を伴う商品
              </li>

              <li>
                VRChatその他関連サービスの規約に違反する
                商品・コンテンツ
              </li>

              <li>
                その他、UruBoothの安全な運営上
                不適切と判断される商品
              </li>
            </ul>
          </section>


          {/* ==================================================
              取り扱いに注意が必要な商品
          ================================================== */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <h2 className="text-xl font-bold">
              取り扱いに注意が必要な商品
            </h2>

            <p className="mt-4 leading-relaxed text-slate-300">
              法令により販売、所持、譲渡、輸出入等に
              許可、届出、資格、年齢確認その他の条件が
              設けられている商品は、
              必要な条件を満たさない状態で販売してはいけません。
            </p>

            <p className="mt-3 leading-relaxed text-slate-300">
              また、人体、動物、環境または財産に
              危険を及ぼす可能性がある商品や、
              安全性を十分に確認できない商品については、
              本サービスを利用した販売を行わないでください。
            </p>
          </section>


          {/* ==================================================
              商品情報
          ================================================== */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <h2 className="text-xl font-bold">
              商品情報は正確に表示してください
            </h2>

            <p className="mt-4 leading-relaxed text-slate-300">
              商品名、価格、状態、サイズ、数量、
              中古・新品の区別その他購入判断に重要な情報を、
              できる限り正確に掲載してください。
            </p>

            <p className="mt-3 leading-relaxed text-slate-300">
              傷、汚れ、欠損、故障、補修歴その他
              購入判断に影響する事項がある場合は、
              購入者に分かるよう説明してください。
            </p>

            <p className="mt-3 leading-relaxed text-slate-300">
              商品の性能、効果、品質等について、
              十分な根拠がない内容を断定的に表示したり、
              実際より著しく優れていると誤認させる表現は
              行わないでください。
            </p>
          </section>


          {/* ==================================================
              HOLD
          ================================================== */}

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
              最終的な注文、決済、購入確定等については、
              販売者が指定する外部販売ページの手続に従ってください。
            </p>
          </section>


          {/* ==================================================
              外部販売ページ
          ================================================== */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <h2 className="text-xl font-bold">
              注文・決済・配送
            </h2>

            <p className="mt-4 leading-relaxed text-slate-300">
              注文、決済、配送先情報の入力等は、
              適切な外部ECサイトまたは決済サービスを利用して
              行ってください。
            </p>

            <p className="mt-3 leading-relaxed text-slate-300">
              販売者は、自ら利用する販売ページ上で、
              商品価格、送料、支払方法、発送時期、
              返品・交換・キャンセル条件その他必要な取引条件を
              適切に表示してください。
            </p>

            <p className="mt-3 leading-relaxed text-slate-300">
              法令上、表示や許可等が必要となる場合は、
              販売者自身の責任で対応してください。
            </p>
          </section>


          {/* ==================================================
              個人情報
          ================================================== */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <h2 className="text-xl font-bold">
              個人情報
            </h2>

            <p className="mt-4 leading-relaxed text-slate-300">
              VRChat上で購入者の住所、電話番号、
              クレジットカード情報、パスワードその他の
              秘密性の高い情報を聞き出さないでください。
            </p>

            <p className="mt-3 leading-relaxed text-slate-300">
              配送先情報および決済情報は、
              適切な外部EC・決済サービスを使用して取得してください。
            </p>
          </section>


          {/* ==================================================
              VRChat
          ================================================== */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <h2 className="text-xl font-bold">
              VRChatでの利用
            </h2>

            <p className="mt-4 leading-relaxed text-slate-300">
              販売者およびスタッフは、
              VRChatのTerms of Service、
              Community Guidelines、
              Creator Guidelinesその他適用されるルールを
              遵守してください。
            </p>

            <p className="mt-3 leading-relaxed text-slate-300">
              他の利用者への迷惑行為、嫌がらせ、
              なりすまし、虚偽の説明その他
              安全な販売イベントの運営を妨げる行為を
              行ってはいけません。
            </p>
          </section>


          {/* ==================================================
              アカウント・システム
          ================================================== */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <h2 className="text-xl font-bold">
              アカウント・システムの利用
            </h2>

            <p className="mt-4 leading-relaxed text-slate-300">
              他人のアカウントを無断で使用したり、
              他人になりすまして販売会を開催してはいけません。
            </p>

            <p className="mt-3 leading-relaxed text-slate-300">
              不正アクセス、システムへの過度な負荷、
              データの不正取得・改ざんその他
              本サービスの正常な運営を妨げる行為は禁止します。
            </p>
          </section>


          {/* ==================================================
              違反時
          ================================================== */}

          <section className="rounded-2xl border border-amber-900 bg-amber-950/20 p-5 sm:p-6">
            <h2 className="text-xl font-bold text-amber-300">
              ルールに違反した場合
            </h2>

            <p className="mt-4 leading-relaxed text-slate-300">
              禁止商品の販売、本ガイドラインへの違反、
              その他安全なサービス運営に重大な影響があると判断した場合、
              販売会の停止、公開停止または
              本サービスの利用制限を行う場合があります。
            </p>
          </section>


          {/* ==================================================
              判断に迷った場合
          ================================================== */}

          <section className="rounded-2xl border border-emerald-900 bg-emerald-950/20 p-5 sm:p-6">
            <h2 className="font-bold text-emerald-300">
              判断に迷った場合
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              商品や販売方法について、
              本サービスで取り扱ってよいか判断できない場合は、
              販売会を開始する前に
              UruBooth運営へ確認してください。
            </p>
          </section>


          {/* ==================================================
              非公式表記
          ================================================== */}

          <section className="border-t border-slate-800 pt-8">
            <p className="text-sm leading-relaxed text-slate-500">
              UruBoothは独立して開発されているプロジェクトであり、
              VRChat Inc.の公式サービスではありません。
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}