import Image from "next/image";
import Link from "next/link";
import { formatOriginalLanguageForStudy } from "../../lib/languageFormat.js";
import { fetchKoreanMovies } from "../../lib/tmdb.js";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "TMDBテスト（韓国語オリジナル）",
  description: "TMDB discover で original_language=ko の映画を20件表示するテストページ",
};

async function loadKoreanOriginalLanguageMovies() {
  try {
    const data = await fetchKoreanMovies({
      page: 1,
      language: "ja-JP",
      // 韓国向けカタログに寄せたいので KR を明示（必要なら外して比較できます）
      region: "KR",
    });

    const results = Array.isArray(data?.results) ? data.results : [];
    return { ok: true, movies: results.slice(0, 20), error: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "映画データの取得に失敗しました";
    return { ok: false, movies: [], error: message };
  }
}

function Poster({ title, posterPath }) {
  const posterUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : "";

  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-white/10">
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={`${title} のポスター`}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
          priority={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm font-medium text-slate-300">
          No Image
        </div>
      )}
    </div>
  );
}

export default async function TmdbTestPage() {
  const result = await loadKoreanOriginalLanguageMovies();
  const movies = result.movies;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl p-6 md:p-10">
        <header className="mb-8 md:mb-10">
          <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100 backdrop-blur">
            TMDB Test
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-4xl">
            韓国語（ko）がオリジナル言語の映画（20件）
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            `discover/movie` の <span className="font-semibold text-white">with_original_language=ko</span> で取得しています（APIキーはサーバー側のみ）。
          </p>
        </header>

        {!result.ok ? (
          <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            {result.error}
          </div>
        ) : null}

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {movies.map((movie) => {
            const id = Number(movie?.id);
            const title = movie?.title ?? movie?.name ?? "Untitled";
            const originalLanguage = String(movie?.original_language ?? "");
            const itemKey = Number.isFinite(id) ? id : `${title}-${movie?.release_date ?? ""}`;

            return (
              <article
                key={itemKey}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:bg-white/10"
              >
                <Link href={Number.isFinite(id) ? `/tmdb-test/${id}` : "#"} className="block">
                  <Poster title={title} posterPath={movie?.poster_path} />
                  <h2 className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-white md:text-[15px]">
                    {title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-300">
                    {movie?.release_date || "公開日未定"}
                  </p>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-300/90">
                    {String(movie?.overview ?? "").trim() || "あらすじ情報は未登録です。"}
                  </p>
                  <div className="mt-3 inline-flex w-fit items-center rounded-full bg-indigo-500/20 px-2.5 py-1 text-[11px] font-medium text-indigo-100 ring-1 ring-indigo-300/30">
                    原語: {formatOriginalLanguageForStudy(originalLanguage)}
                  </div>
                </Link>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
