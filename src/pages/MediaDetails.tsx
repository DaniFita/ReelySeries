import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMovieDetails, getTVDetails, type Lang } from "@/data/mediaData";

const MediaDetails = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();

  const mediaType = type === "tv" ? "tv" : "movie";
  const mediaId = Number(id);

  // default language (same as your Index default)
  const language: Lang = "ro-RO";

  const { data, isLoading, error } = useQuery({
    queryKey: ["details", mediaType, mediaId, language],
    queryFn: async () => {
      if (mediaType === "movie") return getMovieDetails({ id: mediaId, language });
      return getTVDetails({ id: mediaId, language });
    },
    enabled: Number.isFinite(mediaId) && mediaId > 0,
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
      {/* Backdrop */}
      {data.backdrop && (
        <div className="relative h-[220px] sm:h-[320px] overflow-hidden">
          <img
            src={data.backdrop}
            alt={data.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 -mt-16 sm:-mt-20 pb-16">
        <button
          onClick={() => navigate(-1)}
          className="border rounded-lg px-4 py-2 mb-6 bg-black/50 backdrop-blur text-sm"
        >
          ← Back
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Poster */}
          <div className="w-[160px] sm:w-[200px] shrink-0">
            <img
              src={data.poster ?? "/placeholder.svg"}
              alt={data.title}
              className="w-full aspect-[2/3] object-cover rounded-xl border border-white/10"
            />
          </div>

          {/* Info */}
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

            {/* Cast */}
            <div className="mt-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-3">
                Main cast
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {data.cast.map((c) => (
                  <div
                    key={c.id}
                    className="border border-white/10 rounded-xl bg-black/30 p-3"
                  >
                    <div className="text-sm font-semibold line-clamp-2">
                      {c.name}
                    </div>
                    {c.character && (
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {c.character}
                      </div>
                    )}
                  </div>
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