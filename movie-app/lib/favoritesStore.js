export const FAVORITES_STORAGE_KEY = "my-movie-app:favorites:v1";

/** @typedef {{
 *  id: number,
 *  title: string,
 *  poster_path: string | null,
 *  release_date: string,
 *  vote_average: number,
 *  original_language: string,
 *  savedAt: string
 * }} FavoriteMovie */

function isRecord(value) {
  return typeof value === "object" && value !== null;
}

/** @returns {FavoriteMovie[]} */
export function loadFavorites() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => isRecord(item))
      .map((item) => item)
      .filter(
        (item) =>
          typeof item.id === "number" &&
          typeof item.title === "string" &&
          (item.poster_path === null || typeof item.poster_path === "string") &&
          typeof item.release_date === "string" &&
          typeof item.vote_average === "number" &&
          typeof item.original_language === "string" &&
          typeof item.savedAt === "string"
      );
  } catch {
    return [];
  }
}

/** @param {FavoriteMovie[]} favorites */
export function saveFavorites(favorites) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

/** @param {number} id */
export function isFavoriteId(favorites, id) {
  return favorites.some((m) => m.id === id);
}

/**
 * @param {FavoriteMovie[]} favorites
 * @param {Omit<FavoriteMovie, "savedAt">} movie
 * @returns {FavoriteMovie[]}
 */
export function toggleFavorite(favorites, movie) {
  const exists = favorites.some((m) => m.id === movie.id);
  if (exists) {
    return favorites.filter((m) => m.id !== movie.id);
  }

  return [
    {
      ...movie,
      savedAt: new Date().toISOString(),
    },
    ...favorites,
  ];
}
