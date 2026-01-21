export type MediaType = "movie" | "tv";

export interface MediaItem {
  id: number;
  type: MediaType;
  title: string;
  rating: number;
  poster: string | null;
  year: string;
}

export type Lang = "en-US" | "ro-RO" | "es-ES" | "de-DE" | "fr-FR";
export type Region = "RO" | "US" | "DE" | "FR" | "ES";

export type Category =
  | "newest"
  | "mostViewed"
  | "bestRated"
  | "trending"
  | "inCinemas"
  | "comingSoon"
  | "netflix"
  | "disney"
  | "max"
  | "prime"
  | "action"
  | "thriller"
  | "horror"
  | "comedy"
  | "drama"
  | "romance"
  | "sciFi"
  | "fantasy"
  | "crime"
  | "adventure";

type TmdbListResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
};

type TmdbMovie = {
  id: number;
  title: string;
  overview?: string;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  poster_path?: string | null;
  backdrop_path?: string | null;

  original_language?: string;
  genre_ids?: number[];
};

type TmdbTV = {
  id: number;
  name: string;
  overview?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  poster_path?: string | null;
  backdrop_path?: string | null;

  original_language?: string;
  origin_country?: string[];
  genre_ids?: number[];
};

type TmdbPerson = {
  id: number;
  name: string;
  profile_path?: string | null;
  known_for?: Array<any>;
};

type CombinedCredits = {
  cast: Array<
    | (TmdbMovie & { media_type: "movie" })
    | (TmdbTV & { media_type: "tv" })
  >;
};

type Keyword = { id: number; name: string };

type KeywordSearchResponse = {
  page: number;
  results: Keyword[];
  total_pages: number;
};

export type BrowseResult = {
  items: MediaItem[];
  totalPages: number;
};

export type CastPerson = {
  id: number;
  name: string;
  character?: string;
  profile?: string | null;
};

export type MediaDetails = {
  id: number;
  type: MediaType;
  title: string;
  year: string;
  rating: number;
  overview: string;
  poster: string | null;
  backdrop: string | null;
  cast: CastPerson[];
};

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";
const TMDB_IMAGE_ORIGINAL = "https://image.tmdb.org/t/p/original";

function getToken() {
  const token = import.meta.env.VITE_TMDB_TOKEN as string | undefined;
  if (!token) throw new Error("Missing VITE_TMDB_TOKEN");
  return token;
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined>
) {
  const url = new URL(`${TMDB_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length > 0) {
      url.searchParams.set(k, String(v));
    }
  });

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json;charset=utf-8",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDB error ${res.status}: ${text}`);
  }

  return (await res.json()) as T;
}

function movieToItem(m: TmdbMovie): MediaItem {
  return {
    id: m.id,
    type: "movie",
    title: m.title,
    rating: typeof m.vote_average === "number" ? m.vote_average : 0,
    poster: m.poster_path ? `${TMDB_IMAGE}${m.poster_path}` : null,
    year: m.release_date?.slice(0, 4) || "—",
  };
}

function tvToItem(t: TmdbTV): MediaItem {
  return {
    id: t.id,
    type: "tv",
    title: t.name,
    rating: typeof t.vote_average === "number" ? t.vote_average : 0,
    poster: t.poster_path ? `${TMDB_IMAGE}${t.poster_path}` : null,
    year: t.first_air_date?.slice(0, 4) || "—",
  };
}

/**
 * ✅ BLOCK ONLY for TOP/BROWSE lists (NOT for search)
 * - no Japanese/Korean + no Animation in TOP lists
 */
const BLOCK_LANGS = new Set(["ja", "ko"]);
const ANIMATION_GENRE_ID = 16;

function isBlockedMovieForTop(m: TmdbMovie): boolean {
  const lang = (m.original_language || "").toLowerCase();
  const genres = m.genre_ids ?? [];
  return BLOCK_LANGS.has(lang) || genres.includes(ANIMATION_GENRE_ID);
}

function isBlockedTVForTop(t: TmdbTV): boolean {
  const lang = (t.original_language || "").toLowerCase();
  const genres = t.genre_ids ?? [];
  const countries = t.origin_country ?? [];
  return (
    BLOCK_LANGS.has(lang) ||
    genres.includes(ANIMATION_GENRE_ID) ||
    countries.includes("JP") ||
    countries.includes("KR")
  );
}

/**
 * ✅ Genres mapping
 * Movie genre IDs (TMDB standard):
 * Action 28, Adventure 12, Comedy 35, Crime 80, Drama 18,
 * Fantasy 14, Horror 27, Romance 10749, Sci-Fi 878, Thriller 53
 *
 * TV has different Sci-Fi/Fantasy: 10765
 */
const MOVIE_GENRES: Record<
  Exclude<
    Category,
    | "newest"
    | "mostViewed"
    | "bestRated"
    | "trending"
    | "inCinemas"
    | "comingSoon"
    | "netflix"
    | "disney"
    | "max"
    | "prime"
  >,
  number
> = {
  action: 28,
  thriller: 53,
  horror: 27,
  comedy: 35,
  drama: 18,
  romance: 10749,
  sciFi: 878,
  fantasy: 14,
  crime: 80,
  adventure: 12,
};

const TV_GENRES: Record<
  Exclude<
    Category,
    | "newest"
    | "mostViewed"
    | "bestRated"
    | "trending"
    | "inCinemas"
    | "comingSoon"
    | "netflix"
    | "disney"
    | "max"
    | "prime"
  >,
  number
> = {
  action: 10759, // Action & Adventure (TV)
  thriller: 9648, // Mystery (closest)
  horror: 9648, // mystery-ish (TMDB TV horror isn't clean)
  comedy: 35,
  drama: 18,
  romance: 10749,
  sciFi: 10765, // Sci-Fi & Fantasy
  fantasy: 10765,
  crime: 80,
  adventure: 10759,
};

/**
 * ✅ Provider IDs: NO HARD-CODE.
 * We fetch provider list from TMDB and detect Netflix/Disney/Max/Prime by name.
 */
type Provider = { provider_id: number; provider_name: string; logo_path?: string };
type ProviderListResponse = { results: Provider[] };

let providerCacheMovie: Provider[] | null = null;
let providerCacheTV: Provider[] | null = null;

async function getProviders(type: MediaType): Promise<Provider[]> {
  if (type === "movie" && providerCacheMovie) return providerCacheMovie;
  if (type === "tv" && providerCacheTV) return providerCacheTV;

  const data = await tmdbFetch<ProviderListResponse>(`/watch/providers/${type}`, {
    language: "en-US",
    watch_region: "US",
  });

  if (type === "movie") providerCacheMovie = data.results ?? [];
  if (type === "tv") providerCacheTV = data.results ?? [];

  return data.results ?? [];
}

async function getProviderId(type: MediaType, key: "netflix" | "disney" | "max" | "prime") {
  const providers = await getProviders(type);

  const nameMatches: Record<typeof key, string[]> = {
    netflix: ["netflix"],
    disney: ["disney", "disney+"],
    max: ["max", "hbo max", "hbo"],
    prime: ["amazon prime", "prime video"],
  };

  const wanted = nameMatches[key];

  const found = providers.find((p) =>
    wanted.some((w) => p.provider_name.toLowerCase().includes(w))
  );

  return found?.provider_id ?? null;
}

/**
 * ✅ BROWSE MOVIES by CATEGORY
 */
export async function browseMovies(args: {
  page: number;
  language: Lang;
  region: Region;
  category: Category;
}): Promise<BrowseResult> {
  const { page, language, region, category } = args;

  // Built-in list endpoints
  if (category === "inCinemas") {
    const data = await tmdbFetch<TmdbListResponse<TmdbMovie>>("/movie/now_playing", {
      language,
      page,
      region,
    });
    const results = data.results.filter((m) => !isBlockedMovieForTop(m));
    return { items: results.map(movieToItem), totalPages: data.total_pages };
  }

  if (category === "comingSoon") {
    const data = await tmdbFetch<TmdbListResponse<TmdbMovie>>("/movie/upcoming", {
      language,
      page,
      region,
    });
    const results = data.results.filter((m) => !isBlockedMovieForTop(m));
    return { items: results.map(movieToItem), totalPages: data.total_pages };
  }

  if (category === "trending") {
    const data = await tmdbFetch<TmdbListResponse<TmdbMovie>>("/trending/movie/week", {
      language,
      page,
    });
    const results = data.results.filter((m) => !isBlockedMovieForTop(m));
    return { items: results.map(movieToItem), totalPages: data.total_pages };
  }

  // Sort-based categories
  if (category === "newest") {
    const data = await tmdbFetch<TmdbListResponse<TmdbMovie>>("/movie/now_playing", {
      language,
      page,
      region,
    });
    const results = data.results.filter((m) => !isBlockedMovieForTop(m));
    return { items: results.map(movieToItem), totalPages: data.total_pages };
  }

  if (category === "mostViewed") {
    const data = await tmdbFetch<TmdbListResponse<TmdbMovie>>("/movie/popular", {
      language,
      page,
      region,
    });
    const results = data.results.filter((m) => !isBlockedMovieForTop(m));
    return { items: results.map(movieToItem), totalPages: data.total_pages };
  }

  if (category === "bestRated") {
    const data = await tmdbFetch<TmdbListResponse<TmdbMovie>>("/movie/top_rated", {
      language,
      page,
      region,
    });

    let results = data.results.filter((m) => !isBlockedMovieForTop(m));
    // avoid fake "10.0 with 3 votes"
    const filtered = results.filter((m) => (m.vote_count ?? 0) >= 200);
    if (filtered.length >= 10) results = filtered;

    return { items: results.map(movieToItem), totalPages: data.total_pages };
  }

  // Streaming services (discover)
  if (category === "netflix" || category === "disney" || category === "max" || category === "prime") {
    const providerId = await getProviderId("movie", category);
    const data = await tmdbFetch<TmdbListResponse<TmdbMovie>>("/discover/movie", {
      language,
      page,
      watch_region: region,
      with_watch_monetization_types: "flatrate",
      with_watch_providers: providerId ?? undefined,
      sort_by: "popularity.desc",
      include_adult: "false",
    });

    const results = data.results.filter((m) => !isBlockedMovieForTop(m));
    return { items: results.map(movieToItem), totalPages: data.total_pages };
  }

  // Genres
  const genreId = MOVIE_GENRES[category as keyof typeof MOVIE_GENRES];
  const data = await tmdbFetch<TmdbListResponse<TmdbMovie>>("/discover/movie", {
    language,
    page,
    region,
    with_genres: genreId,
    sort_by: "popularity.desc",
    include_adult: "false",
  });

  const results = data.results.filter((m) => !isBlockedMovieForTop(m));
  return { items: results.map(movieToItem), totalPages: data.total_pages };
}

/**
 * ✅ BROWSE TV by CATEGORY
 */
export async function browseTV(args: {
  page: number;
  language: Lang;
  region: Region;
  category: Category;
}): Promise<BrowseResult> {
  const { page, language, region, category } = args;

  if (category === "trending") {
    const data = await tmdbFetch<TmdbListResponse<TmdbTV>>("/trending/tv/week", {
      language,
      page,
    });
    const results = data.results.filter((t) => !isBlockedTVForTop(t));
    return { items: results.map(tvToItem), totalPages: data.total_pages };
  }

  // Sort-ish TV (discover)
  if (category === "newest") {
    const data = await tmdbFetch<TmdbListResponse<TmdbTV>>("/discover/tv", {
      language,
      page,
      sort_by: "first_air_date.desc",
      watch_region: region,
      with_watch_monetization_types: "flatrate|free|ads|rent|buy",
    });
    const results = data.results.filter((t) => !isBlockedTVForTop(t));
    return { items: results.map(tvToItem), totalPages: data.total_pages };
  }

  if (category === "mostViewed") {
    const data = await tmdbFetch<TmdbListResponse<TmdbTV>>("/discover/tv", {
      language,
      page,
      sort_by: "popularity.desc",
      watch_region: region,
      with_watch_monetization_types: "flatrate|free|ads|rent|buy",
    });
    const results = data.results.filter((t) => !isBlockedTVForTop(t));
    return { items: results.map(tvToItem), totalPages: data.total_pages };
  }

  if (category === "bestRated") {
    const data = await tmdbFetch<TmdbListResponse<TmdbTV>>("/discover/tv", {
      language,
      page,
      sort_by: "vote_average.desc",
      "vote_count.gte": 200,
      watch_region: region,
      with_watch_monetization_types: "flatrate|free|ads|rent|buy",
    });
    const results = data.results.filter((t) => !isBlockedTVForTop(t));
    return { items: results.map(tvToItem), totalPages: data.total_pages };
  }

  // Streaming TV (discover)
  if (category === "netflix" || category === "disney" || category === "max" || category === "prime") {
    const providerId = await getProviderId("tv", category);
    const data = await tmdbFetch<TmdbListResponse<TmdbTV>>("/discover/tv", {
      language,
      page,
      watch_region: region,
      with_watch_monetization_types: "flatrate",
      with_watch_providers: providerId ?? undefined,
      sort_by: "popularity.desc",
    });

    const results = data.results.filter((t) => !isBlockedTVForTop(t));
    return { items: results.map(tvToItem), totalPages: data.total_pages };
  }

  // Genres TV
  const genreId = TV_GENRES[category as keyof typeof TV_GENRES];
  const data = await tmdbFetch<TmdbListResponse<TmdbTV>>("/discover/tv", {
    language,
    page,
    with_genres: genreId,
    sort_by: "popularity.desc",
    watch_region: region,
    with_watch_monetization_types: "flatrate|free|ads|rent|buy",
  });

  const results = data.results.filter((t) => !isBlockedTVForTop(t));
  return { items: results.map(tvToItem), totalPages: data.total_pages };
}

/**
 * ✅ SUPER SEARCH
 * Works for:
 * - titles
 * - actors (person search + credits)
 * - topics (keywords + discover boost)
 * - romanian movies queries like "filme romanesti"
 */
function normalizeQuery(q: string) {
  // remove diacritics
  return q
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function isRomanianIntent(q: string) {
  const s = normalizeQuery(q).toLowerCase();
  return (
    s.includes("roman") || // romanesc/romanesti/romania/romanian
    s.includes("romania") ||
    s.includes("romane") ||
    s.includes("romanesti") ||
    s.includes("romanesc") ||
    s.includes("romanian")
  );
}

export async function searchEverything(args: {
  query: string;
  page: number;
  language: Lang;
  region: Region;
}): Promise<BrowseResult> {
  const { query, page, language, region } = args;

  const raw = query.trim();
  if (!raw) return { items: [], totalPages: 1 };

  const q1 = raw;
  const q2 = normalizeQuery(raw);
  const queries = Array.from(new Set([q1, q2, q2.toLowerCase()])).filter(Boolean);

  // If user clearly wants Romanian movies/TV, give them discover results instantly.
  if (isRomanianIntent(raw)) {
    const moviesRO = await tmdbFetch<TmdbListResponse<TmdbMovie>>("/discover/movie", {
      language,
      page,
      region,
      with_original_language: "ro",
      sort_by: "popularity.desc",
      include_adult: "false",
    });

    const tvRO = await tmdbFetch<TmdbListResponse<TmdbTV>>("/discover/tv", {
      language,
      page,
      with_original_language: "ro",
      sort_by: "popularity.desc",
      watch_region: region,
      with_watch_monetization_types: "flatrate|free|ads|rent|buy",
    });

    const merged: MediaItem[] = [
      ...moviesRO.results.map(movieToItem),
      ...tvRO.results.map(tvToItem),
    ];

    return { items: merged, totalPages: Math.max(moviesRO.total_pages, tvRO.total_pages) };
  }

  // 1) Multi search (current language)
  let multi = await tmdbFetch<
    TmdbListResponse<
      | (TmdbMovie & { media_type: "movie" })
      | (TmdbTV & { media_type: "tv" })
      | (TmdbPerson & { media_type: "person" })
    >
  >("/search/multi", {
    query: queries[0],
    page,
    language,
    include_adult: "false",
  });

  // If almost empty, fallback to EN search (TMDB works best in EN)
  if ((multi.results?.length ?? 0) < 3) {
    multi = await tmdbFetch<any>("/search/multi", {
      query: queries[0],
      page,
      language: "en-US",
      include_adult: "false",
    });
  }

  const baseItems: MediaItem[] = (multi.results ?? [])
    .filter((r: any) => r.media_type === "movie" || r.media_type === "tv")
    .map((r: any) => (r.media_type === "movie" ? movieToItem(r) : tvToItem(r)));

  // 2) Person search (explicit) to catch actors better
  // even if multi didn't return persons
  let people: TmdbPerson[] = [];

  for (const q of queries.slice(0, 2)) {
    try {
      const persons = await tmdbFetch<TmdbListResponse<TmdbPerson>>("/search/person", {
        query: q,
        page: 1,
        language: "en-US",
        include_adult: "false",
      });

      people = [...people, ...(persons.results ?? [])];
    } catch {
      // ignore
    }
  }

  // take best 2
  people = people.slice(0, 2);

  const actorCredits: MediaItem[] = [];

  for (const p of people) {
    try {
      const credits = await tmdbFetch<CombinedCredits>(`/person/${p.id}/combined_credits`, {
        language,
      });

      const cast = (credits.cast ?? []).slice(0, 30);

      for (const c of cast) {
        if ((c as any).media_type === "movie") actorCredits.push(movieToItem(c as any));
        if ((c as any).media_type === "tv") actorCredits.push(tvToItem(c as any));
      }
    } catch {
      // ignore
    }
  }

  // 3) Keyword boost (topics like "egypt", "vikings", etc.)
  const keywordItems: MediaItem[] = [];
  try {
    const kw = await tmdbFetch<KeywordSearchResponse>("/search/keyword", {
      query: queries[0],
      page: 1,
    });

    const keywordId = kw.results?.[0]?.id;

    if (keywordId) {
      const moviesKW = await tmdbFetch<TmdbListResponse<TmdbMovie>>("/discover/movie", {
        language,
        region,
        with_keywords: keywordId,
        sort_by: "popularity.desc",
        page: 1,
        include_adult: "false",
      });

      const tvKW = await tmdbFetch<TmdbListResponse<TmdbTV>>("/discover/tv", {
        language,
        watch_region: region,
        with_watch_monetization_types: "flatrate|free|ads|rent|buy",
        with_keywords: keywordId,
        sort_by: "popularity.desc",
        page: 1,
      });

      keywordItems.push(...moviesKW.results.slice(0, 12).map(movieToItem));
      keywordItems.push(...tvKW.results.slice(0, 12).map(tvToItem));
    }
  } catch {
    // ignore
  }

  // Merge + Deduplicate
  const map = new Map<string, MediaItem>();
  const push = (it: MediaItem) => {
    const key = `${it.type}:${it.id}`;
    if (!map.has(key)) map.set(key, it);
  };

  baseItems.forEach(push);
  actorCredits.forEach(push);
  keywordItems.forEach(push);

  const finalItems = Array.from(map.values()).slice(0, 60);

  return { items: finalItems, totalPages: multi.total_pages ?? 1 };
}

/**
 * ✅ DETAILS + CAST
 */
type CreditsResponse = {
  cast: Array<{
    id: number;
    name: string;
    character?: string;
    profile_path?: string | null;
    order?: number;
  }>;
};

export async function getMovieDetails(args: {
  id: number;
  language: Lang;
}): Promise<MediaDetails> {
  const { id, language } = args;

  const details = await tmdbFetch<any>(`/movie/${id}`, { language });
  const credits = await tmdbFetch<CreditsResponse>(`/movie/${id}/credits`, {});

  const cast = (credits.cast ?? [])
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, 12)
    .map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile: c.profile_path ? `${TMDB_IMAGE}${c.profile_path}` : null,
    }));

  return {
    id: details.id,
    type: "movie",
    title: details.title ?? "—",
    year: details.release_date?.slice(0, 4) || "—",
    rating: typeof details.vote_average === "number" ? details.vote_average : 0,
    overview: details.overview ?? "",
    poster: details.poster_path ? `${TMDB_IMAGE}${details.poster_path}` : null,
    backdrop: details.backdrop_path
      ? `${TMDB_IMAGE_ORIGINAL}${details.backdrop_path}`
      : null,
    cast,
  };
}

export async function getTVDetails(args: {
  id: number;
  language: Lang;
}): Promise<MediaDetails> {
  const { id, language } = args;

  const details = await tmdbFetch<any>(`/tv/${id}`, { language });
  const credits = await tmdbFetch<CreditsResponse>(`/tv/${id}/credits`, {});

  const cast = (credits.cast ?? [])
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, 12)
    .map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile: c.profile_path ? `${TMDB_IMAGE}${c.profile_path}` : null,
    }));

  return {
    id: details.id,
    type: "tv",
    title: details.name ?? "—",
    year: details.first_air_date?.slice(0, 4) || "—",
    rating: typeof details.vote_average === "number" ? details.vote_average : 0,
    overview: details.overview ?? "",
    poster: details.poster_path ? `${TMDB_IMAGE}${details.poster_path}` : null,
    backdrop: details.backdrop_path
      ? `${TMDB_IMAGE_ORIGINAL}${details.backdrop_path}`
      : null,
    cast,
  };
}