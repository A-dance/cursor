import Image from "next/image";

function formatReleaseDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr || "";
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function Star({ filled }) {
  return (
    <svg
      className={`h-4 w-4 ${filled ? "text-amber-400" : "text-slate-200"}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        fill="currentColor"
      />
    </svg>
  );
}

function Stars({ rating5 }) {
  const r = clamp(Number(rating5) || 0, 0, 5);
  const full = Math.round(r);
  return (
    <div className="flex items-center gap-1" aria-label={`評価 ${r.toFixed(1)} / 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} filled={i < full} />
      ))}
    </div>
  );
}

async function fetchPopularMovies() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "TMDB_API_KEY が設定されていません（.env.local を確認してください）" };
  }

  const url = new URL("https://api.themoviedb.org/3/movie/popular");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "ja-JP");
  url.searchParams.set("page", "1");

  try {
    const res = await fetch(url.toString(), {
      // APIキーが変わった時だけ再取得したいので、過剰にキャッシュしない
      next: { revalidate: 60 * 30 },
    });

    if (!res.ok) {
      return { ok: false, error: `TMDB API error: ${res.status}` };
    }

    const data = await res.json();
    const results = Array.isArray(data?.results) ? data.results : [];
    return { ok: true, movies: results };
  } catch {
    return { ok: false, error: "TMDB API に接続できませんでした" };
  }
}

export default async function HomePage() {
  const result = await fetchPopularMovies();

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6 md:p-10">
      <header className="mb-6 md:mb-8">
        <p className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
          My Movie App
        </p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          今人気の映画リスト
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          TMDBの人気ランキングから取得して表示しています。
        </p>
      </header>

      {!result.ok ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {result.error}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {result.movies.map((movie) => {
            const title = movie?.title ?? movie?.name ?? "Untitled";
            const releaseDate = movie?.release_date ?? "";
            const rating5 = (Number(movie?.vote_average) || 0) / 2;
            const posterPath = movie?.poster_path ?? "";
            const posterUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : "";

            return (
              <li
                key={movie.id ?? `${title}-${releaseDate}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[2/3] w-full bg-slate-100">
                  {posterUrl ? (
                    <Image
                      src={posterUrl}
                      alt={`${title} のポスター`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={false}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm font-semibold text-slate-500">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="text-center text-base font-extrabold leading-snug text-slate-900">
                    {title}
                  </h2>
                  <div className="mt-3 grid justify-items-center gap-2">
                    <p className="text-xs text-slate-500">公開日：{formatReleaseDate(releaseDate)}</p>
                    <div className="flex items-center gap-2">
                      <Stars rating5={rating5} />
                      <span className="text-xs font-semibold text-slate-500">
                        {clamp(rating5, 0, 5).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
