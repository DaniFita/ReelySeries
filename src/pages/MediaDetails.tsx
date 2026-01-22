import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMediaDetails, type Lang, type Region, type MediaType } from "@/data/mediaData";
import { useSeo } from "@/lib/seo";
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "@/lib/watchlist";
import { trackWatchClick } from "@/lib/track";
import { useMemo, useState } from "react";

const MediaDetails = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();

  const mediaType: MediaType = type === "tv" ? "tv" : "movie";
  const mediaId = Number(id);

  // momentan fix, le facem globale după
  const language: Lang = "ro-RO";
  const region: Region = "RO";

  const [watchlistTick, setWatchlistTick] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["details", mediaType, mediaId, language, region],
    queryFn: () => getMediaDetails({ type: mediaType, id: mediaId, language, region }),
    enabled: Number.isFinite(mediaId) && mediaId > 0,
  });

  const inWatchlist = useMemo(() => {
    if (!data) return false;
    return isInWatchlist(data.type, data.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, watchlistTick]);

  useSeo({
    title: data ? `${data.title} (${data.year}) • ReelySeries` : "Loading… • ReelySeries",
    description: data?.overview?.slice(0, 160),
    image: data?.backdrop ?? data?.poster,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen px-6 py-10 text-muted-foreground">
        Loading details…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen px-6 py-10 text-red-500">
        Failed to load details.
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {data.backdrop && (
        <div className="relative h-[220px] sm:h-[320px] overflow-hidden">
          <img src={data.backdrop} alt={data.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        </div>
      )}

      <div className="px-4 sm:px-6 md:px-12 lg:px-20 -mt-16 sm:-mt-20 pb-16">
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="border border-white/15 rounded-lg px-4 py-2 bg-black/50 backdrop-blur text-sm"
          >
            ← Back
          </button>

          <Link
            to="/watchlist"
            className="border border-white/15 rounded-lg px-4 py-2 bg-white/5 hover:bg-white/10 transition text-sm"
          >
            ⭐ Watchlist
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-[160px] sm:w-[200px] shrink-0">
            <img
              src={data.poster ?? "/placeholder.svg"}
              alt={data.title}
              className="w-full aspect-[2/3] object-cover rounded-xl border border-white/10"
            />

            <button
              onClick={() => {
                if (inWatchlist) {
                  removeFromWatchlist(data.type, data.id);
                } else {
                  addToWatchlist({
                    id: data.id,
                    type: data.type,
                    title: data.title,
                    year: data.year,
                    rating: data.rating,
                    poster: data.poster ?? "",
                    addedAt: Date.now(),
                  });
                }
                setWatchlistTick((x) => x + 1);
              }}
              className="mt-3 w-full border border-white/15 rounded-lg px-4 py-3 bg-white/5 hover:bg-white/10 transition text-sm"
            >
              {inWatchlist ? "✅ In Watchlist" : "⭐ Add to Watchlist"}
            </button>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">{data.title}</h1>

            <div className="mt-2 text-muted-foreground text-sm sm:text-base">
              {data.year} • ★ {data.rating.toFixed(1)}
            </div>

            {data.overview && (
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-foreground/90">
                {data.overview}
              </p>
            )}

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Where to watch</h2>
              <div className="flex flex-wrap gap-2">
                {data.watchButtons.map((b) => (
                  <a
                    key={b.key}
                    href={b.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      trackWatchClick({
                        type: data.type,
                        id: data.id,
                        title: data.title,
                        provider: b.label,
                        url: b.url,
                      })
                    }
                    className="border border-white/15 rounded-lg px-3 py-2 text-sm bg-white/5 hover:bg-white/10 transition"
                  >
                    {b.label}
                  </a>
                ))}
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                (Clicks are tracked locally for now. Next step: real analytics.)
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-3">Trailer</h2>
              {data.trailerUrl ? (
                <a
                  href={data.trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-white/15 rounded-lg px-4 py-3 inline-block bg-white/5 hover:bg-white/10 transition"
                >
                  ▶ Open Trailer on YouTube
                </a>
              ) : (
                <div className="text-muted-foreground text-sm">
                  No trailer found.
                </div>
              )}
            </div>

            <div className="mt-10">
              <h2 className="text-lg sm:text-xl font-semibold mb-3">Main cast</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {data.cast.map((c) => (
                  <Link
                    key={c.id}
                    to={`/actor/${c.id}`}
                    className="border border-white/10 rounded-xl bg-black/30 p-3 hover:bg-white/5 transition"
                  >
                    <div className="text-sm font-semibold line-clamp-2">
                      {c.name}
                    </div>

                    {c.character && (
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {c.character}
                      </div>
                    )}

                    <div className="mt-2 text-[11px] text-primary">
                      View actor →
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetails;