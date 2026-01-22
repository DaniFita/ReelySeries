export type MediaType = "movie" | "tv";

export interface MediaItem {
  id: number;
  type: MediaType;
  title: string;
  rating: number;
  poster: string | null;
  year: string; // "2026"
}

export type Lang = "en-US" | "ro-RO" | "es-ES" | "de-DE" | "fr-FR";
export type Region = "RO" | "US" | "DE" | "FR" | "ES";

export type Category =
  | "trending"
  | "newest"
  | "mostViewed"
  | "bestRated"
  | "inCinemas"
  | "comingSoon"
  | "netflix"
  | "max"
  | "disney"
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

export type ProviderButton = {
  key: "netflix" | "max" | "disney" | "prime" | "apple" | "google";
  label: string;
  url: string;
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
  trailerUrl: string | null;
  watchButtons: ProviderButton[];
};

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

type CreditsResponse = {
  cast: Array<{
    id: number;
    name: string;
    character?: string;
    profile_path?: string | null;
    order?: number;
  }>;
};

type VideosResponse = {
  results: Array<{
    site: string;
    type: string;
    key: string;
    official?: boolean;
    name?: string;
  }>;
};

type WatchProvidersResponse = {
  results: Record<
    string,
    {
      link?: string;
      flatrate?: Array<{ provider_name: string }>;
      rent?: Array<{ provider_name: string }>;
      buy?: Array<{ provider_name: string }>;
    }
  >;
};

type Provider = { provider_id: number; provider_name: string };
type ProviderListResponse = { results: Provider[] };

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";
const TMDB_IMAGE_ORIGINAL = "https://image.tmdb.org/t/p/original";

function getToken() {
  const token = import.meta.env.VITE_TMDB_TOKEN as string | undefined;
  if (!token) throw new Error("Missing VITE_TMDB_TOKEN (.env.local / Vercel env)");
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

/** ✅ Search sort: NEWEST -> OLDEST, then BEST RATING -> WORST */
function sortSearchResults(items: MediaItem[]) {
  const yearNum = (y: string) => {
    const n = Number(y);
    return Number.isFinite(n) ? n : -1;
  };

  return [...items].sort((a, b) => {
    const ya = yearNum(a.year);
    const yb = yearNum(b.year);

    // unknown year -> always at end
    const unkA = ya < 0;
    const unkB = yb < 0;
    if (unkA && !unkB) return 1;
    if (!unkA && unkB) return -1;

    // year DESC
    if (yb !== ya) return yb - ya;

    // rating DESC
    const ra = a.rating ?? 0;
    const rb = b.rating ?? 0;
    if (rb !== ra) return rb - ra;

    return a.title.localeCompare(b.title);
  });
}

/**
 * ✅ BLOCK ONLY for TOP/BROWSE lists (NOT search)
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

/** ✅ Genres */
const MOVIE_GENRES: Record<string, number> = {
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

const TV_GENRES: Record<string, number> = {
  action: 10759,
  thriller: 9648, // close enough
  horror: 9648,
  comedy: 35,
  drama: 18,
  romance: 10749,
  sciFi: 10765,
  fantasy: 10765,
  crime: 80,
  adventure: 10759,
};

/** ✅ Providers detection */
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

  const wanted: Record<typeof key, string[]> = {
    netflix: ["netflix"],
    disney: ["disney", "disney+"],
    max: ["max", "hbo max", "hbo"],
    prime: ["amazon prime", "prime video"],
  };

  const found = providers.find((p) =>
    wanted[key].some((w) => p.provider_name.toLowerCase().includes(w))
  );

  return found?.provider_id ?? null;
}

/** ✅ Browse Movies by Category */
export async function browseMovies(args: {
  page: number;
  language: Lang;
  region: Region;
  category: Category;
}): Promise<BrowseResult> {
  const { page, language, region, category } = args;

  if (category === "trending") {
    const data = await tmdbFetch<TmdbListResponse<TmdbMovie>>("/trending/movie/week", {
      language,
      page,
    });
    const results = data.results.filter((m) => !isBlockedMovieForTop(m));
    return { items: results.map(movieToItem), totalPages: data.total_pages };
  }

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
    const filtered = results.filter((m) => (m.vote_count ?? 0) >= 200);
    if (filtered.length >= 10) results = filtered;
    return { items: results.map(movieToItem), totalPages: data.total_pages };
  }

  if (category === "netflix" || category === "max" || category === "disney" || category === "prime") {
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

  // genres
  const genreId = MOVIE_GENRES[category];
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

/** ✅ Browse TV by Category */
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

  if (category === "netflix" || category === "max" || category === "disney" || category === "prime") {
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

  // genres
  const genreId = TV_GENRES[category];
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

/** ✅ Search helper */
function normalizeQuery(q: string) {
  return q
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function isRomanianIntent(q: string) {
  const s = normalizeQuery(q).toLowerCase();
  return (
    s.includes("roman") ||
    s.includes("romania") ||
    s.includes("romanesti") ||
    s.includes("romanesc") ||
    s.includes("romanian")
  );
}

/**
 * ✅ SUPER SEARCH (movie + tv + actors + topics)
 * ✅ Sorted NEW -> OLD then BEST rating -> WORST
 */
export async function searchEverything(args: {
  query: string;
  page: number;
  language: Lang;
  region: Region;
}): Promise<BrowseResult> {
  const { query, page, language, region } = args;

  const raw = query.trim();
  if (!raw) return { items: [], totalPages: 1 };

  // Special case: "filme romanesti"
  if (isRomanianIntent(raw)) {
    const moviesRO = await tmdbFetch<TmdbListResponse<TmdbMovie>>("/discover/movie", {
      language,
      page,
      region,
      with_original_language: "ro",
      sort_by: "primary_release_date.desc",
      include_adult: "false",
    });

    const tvRO = await tmdbFetch<TmdbListResponse<TmdbTV>>("/discover/tv", {
      language,
      page,
      with_original_language: "ro",
      sort_by: "first_air_date.desc",
      watch_region: region,
      with_watch_monetization_types: "flatrate|free|ads|rent|buy",
    });

    const merged = sortSearchResults([
      ...moviesRO.results.map(movieToItem),
      ...tvRO.results.map(tvToItem),
    ]);

    return {
      items: merged,
      totalPages: Math.max(moviesRO.total_pages, tvRO.total_pages),
    };
  }

  const q1 = raw;
  const q2 = normalizeQuery(raw);
  const queries = Array.from(new Set([q1, q2, q2.toLowerCase()])).filter(Boolean);

  // 1) Multi search
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

  // fallback EN if empty
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

  // 2) Actor search (person) + credits
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
    } catch {}
  }

  people = people.slice(0, 2);

  const actorCredits: MediaItem[] = [];
  for (const p of people) {
    try {
      const credits = await tmdbFetch<CombinedCredits>(`/person/${p.id}/combined_credits`, {
        language,
      });

      const cast = (credits.cast ?? []).slice(0, 40);
      for (const c of cast) {
        if ((c as any).media_type === "movie") actorCredits.push(movieToItem(c as any));
        if ((c as any).media_type === "tv") actorCredits.push(tvToItem(c as any));
      }
    } catch {}
  }

  // 3) Keyword boost (topics)
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

      keywordItems.push(...moviesKW.results.slice(0, 15).map(movieToItem));
      keywordItems.push(...tvKW.results.slice(0, 15).map(tvToItem));
    }
  } catch {}

  // Merge + dedupe
  const map = new Map<string, MediaItem>();
  const push = (it: MediaItem) => {
    const key = `${it.type}:${it.id}`;
    if (!map.has(key)) map.set(key, it);
  };

  baseItems.forEach(push);
  actorCredits.forEach(push);
  keywordItems.forEach(push);

  const finalItems = sortSearchResults(Array.from(map.values())).slice(0, 80);

  return { items: finalItems, totalPages: multi.total_pages ?? 1 };
}

/**
 * ✅ Media Details: trailer + cast + watch buttons (NOT TMDB links)
 */
function getPlatformSearchLinks(title: string): ProviderButton[] {
  const q = encodeURIComponent(title);

  return [
    { key: "netflix", label: "Watch on Netflix", url: `https://www.netflix.com/search?q=${q}` },
    { key: "max", label: "Watch on Max", url: `https://www.max.com/search?q=${q}` },
    { key: "disney", label: "Watch on Disney+", url: `https://www.disneyplus.com/search?q=${q}` },
    { key: "prime", label: "Watch on Prime Video", url: `https://www.primevideo.com/search/ref=atv_nb_sug?phrase=${q}` },
    { key: "apple", label: "Rent/Buy on Apple TV", url: `https://tv.apple.com/search?term=${q}` },
    { key: "google", label: "Rent/Buy on Google Play", url: `https://play.google.com/store/search?q=${q}&c=movies` },
  ];
}

async function getTrailerUrl(type: MediaType, id: number, language: Lang) {
  const data = await tmdbFetch<VideosResponse>(`/${type}/${id}/videos`, {
    language,
  });

  // prefer YouTube Trailer
  const yt = (data.results ?? []).filter((v) => v.site === "YouTube");

  const trailer =
    yt.find((v) => v.type === "Trailer" && v.official) ||
    yt.find((v) => v.type === "Trailer") ||
    yt[0];

  if (!trailer) return null;

  return `https://www.youtube.com/watch?v=${trailer.key}`;
}

async function getCast(type: MediaType, id: number) {
  const data = await tmdbFetch<CreditsResponse>(`/${type}/${id}/credits`, {});
  return (data.cast ?? [])
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, 12)
    .map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile: c.profile_path ? `${TMDB_IMAGE}${c.profile_path}` : null,
    }));
}

async function getWatchProviders(type: MediaType, id: number, region: Region) {
  const data = await tmdbFetch<WatchProvidersResponse>(`/${type}/${id}/watch/providers`, {});
  const r = data.results?.[region];
  if (!r) return [];

  const providers = new Set<string>();
  (r.flatrate ?? []).forEach((p) => providers.add(p.provider_name));
  (r.rent ?? []).forEach((p) => providers.add(p.provider_name));
  (r.buy ?? []).forEach((p) => providers.add(p.provider_name));

  return Array.from(providers);
}

export async function getMediaDetails(args: {
  type: MediaType;
  id: number;
  language: Lang;
  region: Region;
}): Promise<MediaDetails> {
  const { type, id, language, region } = args;

  const details = await tmdbFetch<any>(`/${type}/${id}`, { language });

  const title = type === "movie" ? details.title : details.name;
  const year =
    type === "movie"
      ? details.release_date?.slice(0, 4) || "—"
      : details.first_air_date?.slice(0, 4) || "—";

  const rating = typeof details.vote_average === "number" ? details.vote_average : 0;
  const overview = details.overview ?? "";

  const poster = details.poster_path ? `${TMDB_IMAGE}${details.poster_path}` : null;
  const backdrop = details.backdrop_path
    ? `${TMDB_IMAGE_ORIGINAL}${details.backdrop_path}`
    : null;

  const [cast, trailerUrl, providers] = await Promise.all([
    getCast(type, id),
    getTrailerUrl(type, id, language),
    getWatchProviders(type, id, region),
  ]);

  // buttons are platform search pages, NOT TMDB
  const buttons = getPlatformSearchLinks(title);

  // optional: if none providers in region, still show buttons (user asked direct)
  // providers list could be shown in UI later.

  return {
    id,
    type,
    title,
    year,
    rating,
    overview,
    poster,
    backdrop,
    cast,
    trailerUrl,
    watchButtons: buttons,
  };
}