import PopularMovies from "./components/PopularMovies.js";
import {
  fetchChineseMovies,
  fetchKoreanMovies,
  fetchPopularMovies as fetchPopularMoviesFromTmdb,
} from "../lib/tmdb.js";

async function resolveSearchParams(searchParams) {
  if (typeof searchParams?.then === "function") {
    return await searchParams;
  }
  return searchParams ?? {};
}

/**
 * TMDBの取得はこの Server Component 内に閉じる（`TMDB_API_KEY` をクライアントへ持ち込まない）。
 *
 * UI側（`PopularMovies`）は `movies` 配列を描画するだけ。
 */
async function loadMovies(filter) {
  try {
    const language = "ja-JP";
    const page = 1;

    const data =
      filter === "ko"
        ? await fetchKoreanMovies({ page, language, region: "KR" })
        : filter === "zh"
          ? await fetchChineseMovies({ page, language, region: "CN" })
          : await fetchPopularMoviesFromTmdb({ page, language });

    const results = Array.isArray(data?.results) ? data.results : [];
    return { ok: true, movies: results };
  } catch (err) {
    const message = err instanceof Error ? err.message : "TMDB API に接続できませんでした";
    return { ok: false, error: message, movies: [] };
  }
}

function filterTabs(filter) {
  const tabs = [
    { key: "popular", label: "人気" },
    { key: "ko", label: "韓国語（原作）" },
    { key: "zh", label: "中国語（原作）" },
  ];

  return (
    <nav className="mt-4 flex flex-wrap gap-2" aria-label="映画一覧の絞り込み">
      {tabs.map((tab) => {
        const active = tab.key === filter;
        const href = tab.key === "popular" ? "/" : `/?filter=${tab.key}`;
        return (
          <a
            key={tab.key}
            href={href}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold ring-1 transition",
              active
                ? "bg-slate-900 text-white ring-slate-900"
                : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </a>
        );
      })}
    </nav>
  );
}

export default async function HomePage({ searchParams }) {
  const sp = await resolveSearchParams(searchParams);
  const filterRaw = sp?.filter;
  const filter = filterRaw === "ko" || filterRaw === "zh" ? filterRaw : "popular";

  const result = await loadMovies(filter);

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6 md:p-10">
      <header className="mb-6 md:mb-8">
        <p className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
          My Movie App
        </p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          {filter === "ko"
            ? "韓国語（原作）の映画"
            : filter === "zh"
              ? "中国語（原作）の映画"
              : "今人気の映画リスト"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {filter === "popular"
            ? "TMDBの人気ランキングから取得して表示しています。"
            : "TMDBの discover を使って、原作言語（original_language）で絞り込んだ一覧です。"}
        </p>

        {filterTabs(filter)}
      </header>

      {!result.ok ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {result.error}
        </div>
      ) : (
        <PopularMovies movies={result.movies} />
      )}
    </main>
  );
}
