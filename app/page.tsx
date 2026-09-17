import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-12 flex items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold tracking-[0.25em] text-emerald-400">
              VRC LIVE MARKET
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              販売会を管理
            </h1>

            <p className="mt-3 text-slate-400">
              VRChatで使用する販売会・商品・写真を管理します。
            </p>
          </div>

<Link
  href="/create"
  className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
>
  ＋ 新しい販売会を作る
</Link>
        </header>

        <section>
          <h2 className="mb-5 text-xl font-semibold">
            あなたの販売会
          </h2>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold">
                    9月 鉱物放出会
                  </h3>

                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-400">
                    公開中
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  Market ID：GEM-0001
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  商品数：3
                </p>
              </div>

              <button className="rounded-lg border border-slate-700 px-5 py-2.5 font-medium transition hover:bg-slate-800">
                編集
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}