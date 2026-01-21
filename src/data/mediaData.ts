// src/data/mediaData.ts
// TMDB real data (fără mock-uri)

export interface MediaItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  rating: number;
  poster: string | null;
  year: string;
}

type TMDBListResponse<T> = {
  results: T[];
};

type TMDBMovie = {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
};

type TMDBTV = {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string | null;
  vote_average: number;
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function getToken(): string {
  const token = import.meta.env.VITE_TMDB_TOKEN as string | undefined;
  if (!token) {
    throw new Error(
      "Lipsește VITE_TMDB_TOKEN. Pune token-ul în .env.local și repornește serverul."
    );
  }
  return token;
}

async function tmdbFetch<T>(path: string): Promise<T> {
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

function posterUrl(path: string | null): string | null {
  return path ? `${TMDB_IMAGE_BASE}${path}` : null;
}

function yearFrom(date: string | undefined): string {
  if (!date) return "—";
  return date.slice(0, 4) || "—";
}

// ✅ Top 10 Movies = Trending Movies (week)
export async function getTopMovies(): Promise<MediaItem[]> {
  const data = await tmdbFetch<TMDBListResponse<TMDBMovie>>(
    `/trending/movie/week?language=en-US`
  );

  return data.results.slice(0, 10).map((m) => ({
    id: m.id,
    type: "movie",
    title: m.title,
    rating: m.vote_average,
    poster: posterUrl(m.poster_path),
    year: yearFrom(m.release_date),
  }));
}

// ✅ Top 10 Series = Trending TV (week)
export async function getTopSeries(): Promise<MediaItem[]> {
  const data = await tmdbFetch<TMDBListResponse<TMDBTV>>(
    `/trending/tv/week?language=en-US`
  );

  return data.results.slice(0, 10).map((s) => ({
    id: s.id,
    type: "tv",
    title: s.name,
    rating: s.vote_average,
    poster: posterUrl(s.poster_path),
    year: yearFrom(s.first_air_date),
  }));
}
