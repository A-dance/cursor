import Image from "next/image";
import Link from "next/link";
import { formatOriginalLanguageForStudy } from "../../../lib/languageFormat.js";
import { fetchMovieDetail } from "../../../lib/tmdb.js";

async function resolveParams(params) {
  if (typeof params?.then === "function") {
    return await params;
  }
  return params ?? {};
}

export async function generateMetadata({ params }) {
  const { id } = await resolveParams(params);
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return { title: "TMDB Movie Detail" };
  }

  try {
    const movie = await fetchMovieDetail({ id: numericId, language: "ja-JP" });
    return { title: movie?.title ?? "TMDB Movie Detail" };
  } catch {
    return { title: "TMDB Movie Detail" };
  }
}

export default async function TmdbTestMovieDetailPage({ params }) {
  const { id } = await resolveParams(params);
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl bg-slate-950 px-6 py-10 text-slate-100 md:px-10">
        <p className="text-sm text-rose-300">映画IDが不正です。</p>
        <Link href="/tmdb-test" className="mt-4 inline-block text-sm text-slate-200 underline underline-offset-4">
          一覧へ戻る
        </Link>
      </main>
    );
  }

  let movie;
  try {
    movie = await fetchMovieDetail({ id: numericId, language: "ja-JP" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "映画情報の取得に失敗しました";
    return (
      <main className="mx-auto min-h-screen max-w-5xl bg-slate-950 px-6 py-10 text-slate-100 md:px-10">
        <p className="text-sm text-rose-300">{message}</p>
        <Link href="/tmdb-test" className="mt-4 inline-block text-sm text-slate-200 underline underline-offset-4">
          一覧へ戻る
        </Link>
      </main>
    );
  }

  const title = movie?.title ?? movie?.name ?? "Untitled";
  const overview = String(movie?.overview ?? "").trim();
  const posterPath = movie?.poster_path ?? "";
  const backdropPath = movie?.backdrop_path ?? "";
  const posterUrl = posterPath ? `https://image.tmdb.org/t/p/w780${posterPath}` : "";
  const backdropUrl = backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : "";
  const releaseDate = String(movie?.release_date ?? "");
  const originalLanguage = String(movie?.original_language ?? "");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-12">
        <Link href="/tmdb-test" className="inline-flex items-center text-sm text-slate-300 hover:text-white">
          ← 一覧へ戻る
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/35">
          <div className="relative">
            <div className="absolute inset-0">
              {backdropUrl ? (
                <Image src={backdropUrl} alt="" fill className="object-cover opacity-45" sizes="100vw" priority={false} />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-slate-900 to-black" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
            </div>

            <div className="relative grid grid-cols-1 gap-6 p-6 md:grid-cols-[260px_1fr] md:p-8">
              <div className="relative mx-auto aspect-[2/3] w-[min(280px,85vw)] overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-white/15 md:mx-0 md:w-full">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={`${title} のポスター`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 85vw, 260px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-4 text-sm text-slate-300">No Image</div>
                )}
              </div>

              <div className="min-w-0">
                <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h1>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-slate-100">
                    原語: {formatOriginalLanguageForStudy(originalLanguage)}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-slate-100">
                    公開日: {releaseDate || "未定"}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-slate-100">
                    評価: {typeof movie?.vote_average === "number" ? `${movie.vote_average.toFixed(1)} / 10` : "—"}
                  </span>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
                  <h2 className="text-sm font-semibold text-slate-200">あらすじ</h2>
                  {overview ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{overview}</p>
                  ) : (
                    <p className="mt-2 text-sm text-slate-300">あらすじは未登録です。</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
