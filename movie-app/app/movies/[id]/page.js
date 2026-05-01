import Image from "next/image";
import Link from "next/link";
import MovieFavoriteButton from "../../components/MovieFavoriteButton.js";
import { formatOriginalLanguageForStudy } from "../../../lib/languageFormat.js";
import { fetchMovieDetails } from "../../../lib/tmdb.js";

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
    return { title: "映画詳細" };
  }

  try {
    const movie = await fetchMovieDetails({ id: numericId, language: "ja-JP" });
    const title = movie?.title ?? movie?.name ?? "映画詳細";
    return { title };
  } catch {
    return { title: "映画詳細" };
  }
}

export default async function MovieDetailPage({ params }) {
  const { id } = await resolveParams(params);
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl p-6 md:p-10">
        <p className="text-sm text-rose-700">映画IDが不正です。</p>
        <Link className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:underline" href="/">
          ホームへ戻る
        </Link>
      </main>
    );
  }

  let movie;
  try {
    movie = await fetchMovieDetails({ id: numericId, language: "ja-JP" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "映画情報の取得に失敗しました";
    return (
      <main className="mx-auto min-h-screen max-w-3xl p-6 md:p-10">
        <p className="text-sm text-rose-700">{message}</p>
        <Link className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:underline" href="/">
          ホームへ戻る
        </Link>
      </main>
    );
  }

  const title = movie?.title ?? movie?.name ?? "Untitled";
  const overview = String(movie?.overview ?? "").trim();
  const releaseDate = String(movie?.release_date ?? "");
  const posterPath = movie?.poster_path ?? "";
  const posterUrl = posterPath ? `https://image.tmdb.org/t/p/w780${posterPath}` : "";
  const backdropPath = movie?.backdrop_path ?? "";
  const backdropUrl = backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : "";
  const originalLanguage = String(movie?.original_language ?? "");
  const tagline = String(movie?.tagline ?? "").trim();

  const favoritePayload = {
    id: numericId,
    title,
    poster_path: posterPath ? String(posterPath) : null,
    release_date: releaseDate,
    vote_average: Number(movie?.vote_average) || 0,
    original_language: originalLanguage,
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6 md:p-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/" className="text-sm font-semibold text-blue-700 hover:underline">
          ← ホーム
        </Link>
      </div>

      <section className="overflow-hidden rounded-[28px] bg-slate-950 shadow-2xl ring-1 ring-slate-900/10">
        <div className="relative">
          <div className="absolute inset-0">
            {backdropUrl ? (
              <Image alt="" src={backdropUrl} fill className="object-cover opacity-55" sizes="100vw" priority={false} />
            ) : posterUrl ? (
              <Image alt="" src={posterUrl} fill className="object-cover opacity-35 blur-sm" sizes="100vw" priority={false} />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-950 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          </div>

          <div className="relative grid grid-cols-1 gap-6 p-6 md:grid-cols-[240px_1fr] md:p-8 lg:grid-cols-[280px_1fr]">
            <div className="space-y-4">
              <div className="relative mx-auto aspect-[2/3] w-[min(320px,86vw)] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/15 md:mx-0 md:w-full">
                {posterUrl ? (
                  <Image src={posterUrl} alt={`${title} のポスター`} fill className="object-cover" sizes="(max-width: 768px) 86vw, 280px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-900 px-6 text-center text-sm font-semibold text-slate-200">
                    No Image
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white shadow-sm backdrop-blur-md">
                <MovieFavoriteButton variant="dark" movie={favoritePayload} />
                <p className="mt-2 text-xs text-white/70">お気に入りはブラウザに保存されます（LocalStorage）。</p>
              </div>
            </div>

            <div className="min-w-0 text-white">
              <header className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur">
                    原作言語: {formatOriginalLanguageForStudy(originalLanguage)}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur">
                    公開日: {releaseDate || "—"}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur">
                    評価: {typeof movie?.vote_average === "number" ? `${movie.vote_average.toFixed(1)} / 10` : "—"}
                  </span>
                </div>

                <h1 className="text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
                {tagline ? <p className="text-sm font-semibold text-white/80 md:text-base">“{tagline}”</p> : null}
              </header>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5 shadow-sm backdrop-blur-md">
                <h2 className="text-sm font-semibold text-white/70">あらすじ</h2>
                {overview ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/90 md:text-base">{overview}</p>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-white/70">あらすじは未登録のようです。</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
