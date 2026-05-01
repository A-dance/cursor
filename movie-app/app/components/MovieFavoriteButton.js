"use client";

import { useEffect, useMemo, useState } from "react";
import { FAVORITES_STORAGE_KEY, loadFavorites, saveFavorites, toggleFavorite } from "../../lib/favoritesStore.js";

/**
 * @param {{
 *  movie: {
 *    id: number,
 *    title: string,
 *    poster_path: string | null,
 *    release_date: string,
 *    vote_average: number,
 *    original_language: string,
 *  },
 *  variant?: "light" | "dark",
 * }} props
 */
export default function MovieFavoriteButton({ movie, variant = "light" }) {
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

  const favorited = useMemo(() => favorites.some((m) => m.id === movie.id), [favorites, movie.id]);

  const base =
    variant === "dark"
      ? [
          "inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium ring-1 transition",
          !hydrated ? "cursor-not-allowed bg-white/5 text-white/40 ring-white/10" : "bg-slate-800 text-slate-100 ring-slate-700 hover:bg-slate-700",
          hydrated && favorited ? "bg-slate-700 text-slate-100 ring-slate-600" : "",
        ]
      : [
          "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ring-1 transition",
          !hydrated ? "cursor-not-allowed bg-slate-50 text-slate-400 ring-slate-200" : "bg-slate-800 text-white ring-slate-700 hover:bg-slate-700",
          hydrated && favorited ? "bg-slate-700 text-white ring-slate-600" : "",
        ];

  return (
    <button
      type="button"
      onClick={() => {
        setFavorites((prev) => {
          const next = toggleFavorite(prev, movie);
          saveFavorites(next);
          return next;
        });
      }}
      disabled={!hydrated}
      aria-pressed={favorited}
      className={base.join(" ")}
    >
      {!hydrated ? "読込中…" : favorited ? "お気に入り済み" : "お気に入りに追加"}
    </button>
  );
}
