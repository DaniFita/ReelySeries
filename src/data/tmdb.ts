// src/data/tmdb.ts

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function getToken(): string {
  const token = import.meta.env.VITE_TMDB_TOKEN as string | undefined;
  if (!token) {
    throw new Error(
      "Missing VITE_TMDB_TOKEN. Check .env.local (local) and Vercel Env Vars (prod)."
    );
  }
  return token;
}

export async function tmdbFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${TMDB_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDB error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export function yearFrom(date?: string) {
  if (!date) return "—";
  return date.slice(0, 4) || "—";
}
