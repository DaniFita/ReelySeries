import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { tmdbFetch, TMDB_IMAGE_BASE, yearFrom } from "@/data/tmdb";

type TMDBMovieDetails = {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  poster_path: string | null;
};

type TMDBVideosResponse = {
  results: Array<{
    id: string;
    key: string; // YouTube video id
    name: string;
    site: string; // "YouTube"
    type: string; // "Trailer", "Teaser", etc
    official: boolean;
  }>;
};

type WatchProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
};

type TMDBWatchProvidersResponse = {
  results: Record<
    string,
    {
      link?: string;
      flatrate?: WatchProvider[];
      rent?: WatchProvider[];
      buy?: WatchProvider[];
    }
  >;
};

function providerLogo(logoPath: string | null) {
  if (!logoPath) return null;
  return `https://image.tmdb.org/t/p/w92${logoPath}`;
}

export default function MovieDetails() {
  const { id } = useParams();
  const movieId = Number(id);

  const [country, setCountry] = useState<"RO" | "US">("RO");

  const { data, isLoading, error } = useQuery({
    queryKey: ["movieDetails", movieId],
    queryFn: () => tmdbFetch<TMDBMovieDetails>(`/movie/${movieId}?language=en-US`),
    enabled: Number.isFinite(movieId),
  });

  const { data: videos } = useQuery({
    queryKey: ["movieVideos", movieId],
    queryFn: () => tmdbFetch<TMDBVideosResponse>(`/movie/${movieId}/videos?language=en-US`),
    enabled: Number.isFinite(movieId),
  });

  const { data: providers } = useQuery({
    queryKey: ["movieProviders", movieId],
    queryFn: () => tmdbFetch<TMDBWatchProvidersResponse>(`/movie/${movieId}/watch/providers`),
    enabled: Number.isFinite(movieId),
  });

  const trailerKey = useMemo(() => {
    const list = videos?.results ?? [];
    const best =
      list.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
      list.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
      list.find((v) => v.site === "YouTube" && v.type === "Teaser") ||
      null;
    return best?.key ?? null;
  }, [videos]);

  const countryProviders = useMemo(() => {
    const all = providers?.results ?? {};
    // încearcă RO, apoi US, apoi orice există
    return all[country] || all["RO"] || all["US"] || Object.values(all)[0] || null;
  }, [providers, country]);

  if (!Number.isFinite(movieId)) {
    return (
      <div className="min-h-screen px-6 py-6">
        <Link to="/" className="underline text-muted-foreground">
          ← Back
        </Link>
        <p className="mt-4">Invalid movie ID.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="min-h-screen px-6 py-6">Loading movie details...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen px-6 py-6">
        <Link to="/" className="underline text-muted-foreground">
          ← Back
        </Link>
        <p className="mt-4 text-red-500 font-semibold">Failed to load movie.</p>
        <pre className="mt-2 text-xs opacity-70 whitespace-pre-wrap">
          {(error as Error).message}
        </pre>
      </div>
    );
  }

  if (!data) return null;

  const posterUrl = data.poster_path ? `${TMDB_IMAGE_BASE}${data.poster_path}` : null;

  return (
    <div className="min-h-screen px-6 py-6 max-w-5xl mx-auto">
      <Link to="/" className="underline text-muted-foreground">
        ← Back
      </Link>

      <div className="mt-6 grid gap-6 md:grid-cols-[300px_1fr]">
        <div>
          <img
            src={posterUrl ?? "/placeholder.svg"}
            alt={data.title}
            className="w-full rounded-xl border"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            {data.title}{" "}
            <span className="text-muted-foreground">({yearFrom(data.release_date)})</span>
          </h1>

          <div className="mt-2 text-muted-foreground">
            ⭐ {data.vote_average.toFixed(1)}
          </div>

          <p className="mt-4 leading-relaxed">
            {data.overview || "No description available."}
          </p>

          {/* Watch Providers */}
          <div className="mt-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Where to watch</h2>

              <select
                value={country}
                onChange={(e) => setCountry(e.target.value as "RO" | "US")}
                className="border rounded-md px-2 py-1 bg-transparent"
              >
                <option value="RO">RO</option>
                <option value="US">US</option>
              </select>
            </div>

            {!countryProviders ? (
              <p className="mt-2 text-muted-foreground">
                No watch providers available.
              </p>
            ) : (
              <div className="mt-3 space-y-4">
                {countryProviders.flatrate && countryProviders.flatrate.length > 0 && (
                  <div>
                    <div className="font-semibold mb-2">Stream</div>
                    <div className="flex flex-wrap gap-2">
                      {countryProviders.flatrate.map((p) => (
                        <a
                          key={`stream-${p.provider_id}`}
                          href={countryProviders.link || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 border rounded-lg px-3 py-2 hover:bg-white/5"
                        >
                          {providerLogo(p.logo_path) ? (
                            <img
                              src={providerLogo(p.logo_path)!}
                              alt={p.provider_name}
                              className="w-6 h-6 rounded"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded bg-white/10" />
                          )}
                          <span>{p.provider_name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {countryProviders.rent && countryProviders.rent.length > 0 && (
                  <div>
                    <div className="font-semibold mb-2">Rent</div>
                    <div className="flex flex-wrap gap-2">
                      {countryProviders.rent.map((p) => (
                        <a
                          key={`rent-${p.provider_id}`}
                          href={countryProviders.link || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 border rounded-lg px-3 py-2 hover:bg-white/5"
                        >
                          {providerLogo(p.logo_path) ? (
                            <img
                              src={providerLogo(p.logo_path)!}
                              alt={p.provider_name}
                              className="w-6 h-6 rounded"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded bg-white/10" />
                          )}
                          <span>{p.provider_name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {countryProviders.buy && countryProviders.buy.length > 0 && (
                  <div>
                    <div className="font-semibold mb-2">Buy</div>
                    <div className="flex flex-wrap gap-2">
                      {countryProviders.buy.map((p) => (
                        <a
                          key={`buy-${p.provider_id}`}
                          href={countryProviders.link || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 border rounded-lg px-3 py-2 hover:bg-white/5"
                        >
                          {providerLogo(p.logo_path) ? (
                            <img
                              src={providerLogo(p.logo_path)!}
                              alt={p.provider_name}
                              className="w-6 h-6 rounded"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded bg-white/10" />
                          )}
                          <span>{p.provider_name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trailer */}
          {trailerKey && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Trailer</h2>
              <div className="aspect-video w-full overflow-hidden rounded-xl border">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${trailerKey}`}
                  title="YouTube trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
