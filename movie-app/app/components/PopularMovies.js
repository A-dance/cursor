"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FAVORITES_STORAGE_KEY, loadFavorites, saveFavorites, toggleFavorite } from "../../lib/favoritesStore.js";

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

function formatOriginalLanguage(code) {
  const c = String(code || "").toLowerCase().trim();
  if (!c) return "不明";

  // TMDBの `original_language` は基本的に ISO 639-1（例: en=英語, ko=韓国語, zh=中国語系）
  // ※作品によっては「制作国の事情」で英語原作になっていることもありますが、コード自体は言語を表します。
  const map = {
    en: "英語",
    ko: "韓国語",
    zh: "中国語",
    ja: "日本語",
    fr: "フランス語",
    de: "ドイツ語",
    es: "スペイン語",
    it: "イタリア語",
    pt: "ポルトガル語",
    ru: "ロシア語",
    vi: "ベトナム語",
    th: "タイ語",
    id: "インドネシア語",
    hi: "ヒンディー語",
  };

  return map[c] ?? `その他（${c}）`;
}

function FavoriteToggleButton({ hydrated, favorited, disabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={favorited}
      className={[
        "absolute right-2 top-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 backdrop-blur transition",
        disabled ? "cursor-not-allowed bg-white/70 text-slate-400 ring-slate-200" : "bg-white/90 text-slate-800 ring-slate-200 hover:bg-white",
        !disabled && favorited ? "text-rose-700 ring-rose-200" : "",
      ].join(" ")}
    >
      {disabled ? "読込中…" : favorited ? "★ お気に入り済み" : "☆ お気に入り"}
    </button>
  );
}

/**
 * @param {{ movies: any[] }} props
 */
export default function PopularMovies({ movies }) {
  const [favorites, setFavorites] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFavorites(loadFavorites());
    setHydrated(true);

    const onStorage = (event) => {
      if (event.key && event.key !== FAVORITES_STORAGE_KEY) return;
      setFavorites(loadFavorites());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const favoriteIds = useMemo(() => new Set(favorites.map((m) => m.id)), [favorites]);

  const favoriteCount = favorites.length;

  return (
    <div>
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-slate-900">お気に入り（ローカル保存）</p>
            <p className="mt-1 text-xs text-slate-500">
              ブラウザの LocalStorage に保存されます（端末内のみ）。将来の絞り込みに使えるよう、原作言語（TMDBの言語コード）も一緒に保存します（表示は日本語にしています）。
            </p>
          </div>
          <div className="text-sm font-semibold text-slate-800">{favoriteCount}件</div>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        {movies.map((movie) => {
          const idRaw = movie?.id;
          const id = typeof idRaw === "number" ? idRaw : Number(idRaw);
          const title = movie?.title ?? movie?.name ?? "Untitled";
          const releaseDate = movie?.release_date ?? "";
          const rating5 = (Number(movie?.vote_average) || 0) / 2;
          const posterPath = movie?.poster_path ?? "";
          const posterUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : "";
          const originalLanguage = String(movie?.original_language ?? "");

          const favorited = Number.isFinite(id) ? favoriteIds.has(id) : false;

          return (
            <li
              key={Number.isFinite(id) ? id : `${title}-${releaseDate}`}
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

                <FavoriteToggleButton
                  hydrated={hydrated}
                  favorited={favorited}
                  disabled={!hydrated || !Number.isFinite(id)}
                  onToggle={() => {
                    if (!Number.isFinite(id)) return;

                    setFavorites((prev) => {
                      const next = toggleFavorite(prev, {
                        id,
                        title,
                        poster_path: posterPath ? String(posterPath) : null,
                        release_date: String(releaseDate ?? ""),
                        vote_average: Number(movie?.vote_average) || 0,
                        original_language: originalLanguage,
                      });
                      saveFavorites(next);
                      return next;
                    });
                  }}
                />
              </div>

              <div className="p-4">
                <h2 className="text-center text-base font-extrabold leading-snug text-slate-900">{title}</h2>
                <div className="mt-3 grid justify-items-center gap-2">
                  <p className="text-xs text-slate-500">公開日：{formatReleaseDate(releaseDate)}</p>
                  <p className="text-[11px] text-slate-400">原語: {formatOriginalLanguage(originalLanguage)}</p>
                  <div className="flex items-center gap-2">
                    <Stars rating5={rating5} />
                    <span className="text-xs font-semibold text-slate-500">{clamp(rating5, 0, 5).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
