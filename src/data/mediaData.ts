// src/data/mediaData.ts
import { tmdbFetch, TMDB_IMAGE_BASE } from "@/data/tmdb";

export interface MediaItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  rating: number;
  poster: string | null;
  year: string;
  overview: string;
}

type TMDBListResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

type TMDBMovie = {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
};

type TMDBTV = {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  poster_path: string | null;
  vote_average: number;
};

function posterUrl(path: string | null): string | null {
  return path ? `${TMDB_IMAGE_BASE}${path}` : null;
}

function yearFrom(date: string | undefined): string {
  if (!date) return "—";
  return date.slice(0, 4) || "—";
}

/**
 * MOVIES browse (discover)
 * sort examples:
 * - popularity.desc (most viewed-ish)
 * - primary_release_date.desc (newest)
 * - vote_average.desc (best rated-ish)
 */
export async function browseMovies(params: {
  page: number;
  language: string; // "en-US", "ro-RO", etc
  region: string;   // "RO", "US", etc
  sortBy: string;   // "popularity.desc" etc
}): Promise<{ items: MediaItem[]; totalPages: number }> {
  const { page, language, region, sortBy } = params;

  const data = await tmdbFetch<TMDBListResponse<TMDBMovie>>(
    `/discover/movie?language=${encodeURIComponent(language)}&region=${encodeURIComponent(
      region
    )}&sort_by=${encodeURIComponent(sortBy)}&page=${page}&vote_count.gte=200`
  );

  return {
    items: data.results.map((m) => ({
      id: m.id,
      type: "movie",
      title: m.title,
      year: yearFrom(m.release_date),
      rating: m.vote_average,
      overview: m.overview,
      poster: posterUrl(m.poster_path),
    })),
    totalPages: data.total_pages,
  };
}

export async function browseTV(params: {
  page: number;
  language: string;
  region: string;
  sortBy: string;
}): Promise<{ items: MediaItem[]; totalPages: number }> {
  const { page, language, region, sortBy } = params;

  // discover tv nu are region fix la fel ca movies, dar language merge
  const data = await tmdbFetch<TMDBListResponse<TMDBTV>>(
    `/discover/tv?language=${encodeURIComponent(language)}&sort_by=${encodeURIComponent(
      sortBy
    )}&page=${page}&vote_count.gte=200`
  );

  return {
    items: data.results.map((t) => ({
      id: t.id,
      type: "tv",
      title: t.name,
      year: yearFrom(t.first_air_date),
      rating: t.vote_average,
      overview: t.overview,
      poster: posterUrl(t.poster_path),
    })),
    totalPages: data.total_pages,
  };
}

/**
 * SEARCH
 */
export async function searchMulti(params: {
  query: string;
  page: number;
  language: string;
}): Promise<{ items: MediaItem[]; totalPages: number }> {
  const { query, page, language } = params;

  const data = await tmdbFetch<TMDBListResponse<any>>(
    `/search/multi?language=${encodeURIComponent(language)}&query=${encodeURIComponent(
      query
    )}&page=${page}&include_adult=false`
  );

  const items: MediaItem[] = data.results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .map((r) => {
      if (r.media_type === "movie") {
        return {
          id: r.id,
          type: "movie",
          title: r.title,
          year: yearFrom(r.release_date),
          rating: r.vote_average ?? 0,
          overview: r.overview ?? "",
          poster: posterUrl(r.poster_path ?? null),
        };
      }
      return {
        id: r.id,
        type: "tv",
        title: r.name,
        year: yearFrom(r.first_air_date),
        rating: r.vote_average ?? 0,
        overview: r.overview ?? "",
        poster: posterUrl(r.poster_path ?? null),
      };
    });

  return { items, totalPages: data.total_pages };
}
