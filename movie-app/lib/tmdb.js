/**
 * TMDB API helper (server-side usage intended).
 *
 * Notes:
 * - Reads `process.env.TMDB_API_KEY` from `.env.local` (Next.js loads it for server code).
 * - Prefer `discover/movie` for language-centric lists (Korean/Chinese originals).
 */

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

function requireApiKey() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY が設定されていません（.env.local を確認してください）");
  }
  return apiKey;
}

/**
 * @param {string} path
 * @param {Record<string, string | number | boolean | undefined | null>} [searchParams]
 * @param {RequestInit} [init]
 */
export async function tmdbFetchJson(path, searchParams, init) {
  const apiKey = requireApiKey();

  const url = new URL(`${TMDB_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);
  url.searchParams.set("api_key", apiKey);

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }

  const res = await fetch(url.toString(), init);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TMDB API error: ${res.status}${body ? ` — ${body.slice(0, 200)}` : ""}`);
  }

  return res.json();
}

/**
 * @param {{
 *  page?: number,
 *  language?: string,
 * }} [opts]
 */
export async function fetchPopularMovies(opts = {}) {
  const page = opts.page ?? 1;
  const language = opts.language ?? "ja-JP";

  return tmdbFetchJson(
    "/movie/popular",
    {
      language,
      page,
    },
    {
      next: { revalidate: 60 * 30 },
    }
  );
}

/**
 * TMDB `discover/movie` wrapper.
 *
 * Helpful knobs for language learners:
 * - `with_original_language`: e.g. "ko", "zh" (Mandarin is often still `zh` at TMDB; nuances can be refined later)
 * - `region`: e.g. "KR", "CN", "TW", "HK"
 *
 * @param {{
 *  page?: number,
 *  language?: string,
 *  region?: string,
 *  withOriginalLanguage?: string,
 *  sortBy?: string,
 *  includeAdult?: boolean,
 * }} [opts]
 */
export async function discoverMovies(opts = {}) {
  const page = opts.page ?? 1;
  const language = opts.language ?? "ja-JP";

  return tmdbFetchJson(
    "/discover/movie",
    {
      language,
      page,
      region: opts.region,
      with_original_language: opts.withOriginalLanguage,
      sort_by: opts.sortBy ?? "popularity.desc",
      include_adult: opts.includeAdult ?? false,
    },
    {
      next: { revalidate: 60 * 30 },
    }
  );
}

/** @param {{ page?: number, language?: string, region?: string }} [opts] */
export async function fetchKoreanMovies(opts = {}) {
  return discoverMovies({
    ...opts,
    withOriginalLanguage: "ko",
    region: opts.region ?? "KR",
    sortBy: "popularity.desc",
  });
}

/**
 * Chinese originals are commonly `zh` in TMDB metadata, but regional catalogs differ.
 * This helper defaults to a broad `zh` original-language filter; pass `region` to bias results.
 *
 * @param {{ page?: number, language?: string, region?: string }} [opts]
 */
export async function fetchChineseMovies(opts = {}) {
  return discoverMovies({
    ...opts,
    withOriginalLanguage: "zh",
    region: opts.region,
    sortBy: "popularity.desc",
  });
}

/**
 * @param {{
 *  id: number,
 *  language?: string,
 * }} opts
 */
export async function fetchMovieDetail(opts) {
  const language = opts.language ?? "ja-JP";
  const id = opts.id;
  if (!Number.isFinite(Number(id))) {
    throw new Error("movie id が不正です");
  }

  return tmdbFetchJson(`/movie/${encodeURIComponent(String(id))}`, { language }, { next: { revalidate: 60 * 30 } });
}

// Backward-compatible alias for existing imports.
export const fetchMovieDetails = fetchMovieDetail;
