"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatOriginalLanguageForStudy } from "../../lib/languageFormat.js";
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

function FavoriteToggleButton({ hydrated, favorited, disabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      disabled={disabled}
      aria-pressed={favorited}
      className={[
        "absolute right-2 top-2 z-20 rounded-md px-2.5 py-1 text-xs font-medium shadow-sm ring-1 transition",
        disabled ? "cursor-not-allowed bg-slate-50 text-slate-400 ring-slate-200" : "bg-slate-800 text-white ring-slate-700 hover:bg-slate-700",
        !disabled && favorited ? "bg-slate-700 text-white ring-slate-600" : "",
      ].join(" ")}
    >
      {disabled ? "読込中…" : favorited ? "お気に入り済み" : "お気に入り"}
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
              ブラウザの LocalStorage に保存されます（端末内のみ）。学習向けに、原作言語は「日本語名 + TMDBの言語コード」を併記して保存します。
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
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/60 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative aspect-[2/3] w-full bg-slate-950">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={`${title} のポスター`}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={false}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm font-semibold text-slate-500">
                    No Image
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                  <span className="pointer-events-none rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-900 shadow-sm ring-1 ring-white/40 backdrop-blur">
                    原作言語: {formatOriginalLanguageForStudy(originalLanguage)}
                  </span>
                </div>

                {Number.isFinite(id) ? (
                  <Link href={`/movies/${id}`} className="absolute inset-0 z-0" aria-label={`${title}の詳細へ`} />
                ) : null}

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
                <h2 className="text-center text-base font-extrabold leading-snug text-slate-900">
                  {Number.isFinite(id) ? (
                    <Link className="text-slate-900 hover:text-slate-700" href={`/movies/${id}`}>
                      {title}
                    </Link>
                  ) : (
                    title
                  )}
                </h2>
                <div className="mt-3 grid justify-items-center gap-2">
                  <p className="text-xs text-slate-500">公開日：{formatReleaseDate(releaseDate)}</p>
                  <p className="text-[11px] text-slate-600">
                    原作言語: <span className="font-semibold">{formatOriginalLanguageForStudy(originalLanguage)}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Stars rating5={rating5} />
                    <span className="text-xs font-semibold text-slate-500">{clamp(rating5, 0, 5).toFixed(1)}</span>
                  </div>
                  {Number.isFinite(id) ? (
                    <Link href={`/movies/${id}`} className="text-xs font-medium text-slate-700 hover:text-slate-900">
                      詳細を見る
                    </Link>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
