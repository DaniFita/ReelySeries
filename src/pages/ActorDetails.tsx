import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPersonDetails, getPersonCredits } from "@/data/mediaData";
import { useSeo } from "@/lib/seo";

const ActorDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const personId = Number(id);

  const details = useQuery({
    queryKey: ["personDetails", personId],
    queryFn: () => getPersonDetails(personId),
    enabled: Number.isFinite(personId) && personId > 0,
  });

  const credits = useQuery({
    queryKey: ["personCredits", personId],
    queryFn: () => getPersonCredits(personId),
    enabled: Number.isFinite(personId) && personId > 0,
  });

  useSeo({
    title: details.data ? `${details.data.name} • ReelySeries` : "Actor • ReelySeries",
    description: details.data?.biography?.slice(0, 160),
    image: details.data?.profile,
  });

  if (details.isLoading || credits.isLoading) {
    return (
      <div className="min-h-screen px-6 py-10 text-muted-foreground">
        Loading actor…
      </div>
    );
  }

  if (details.error || credits.error || !details.data) {
    return (
      <div className="min-h-screen px-6 py-10 text-red-500">
        Failed to load actor.
      </div>
    );
  }

  const actor = details.data;
  const items = credits.data ?? [];

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-12 lg:px-20 py-10">
      <button
        onClick={() => navigate(-1)}
        className="border border-white/15 rounded-lg px-4 py-2 mb-6 bg-black/50 backdrop-blur text-sm"
      >
        ← Back
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        {actor.profile ? (
          <img
            src={actor.profile}
            alt={actor.name}
            className="w-[180px] md:w-[220px] rounded-xl border border-white/10 object-cover"
          />
        ) : (
          <div className="w-[180px] md:w-[220px] h-[280px] rounded-xl border border-white/10 bg-white/5" />
        )}

        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">{actor.name}</h1>

          <div className="mt-2 text-sm text-muted-foreground">
            Popularity: {actor.popularity.toFixed(1)}
          </div>

          {actor.biography ? (
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-foreground/90">
              {actor.biography}
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No biography found.
            </p>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Known for</h2>

        {items.length === 0 ? (
          <div className="text-muted-foreground text-sm">No credits found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {items.slice(0, 20).map((m) => (
              <Link
                key={`${m.type}-${m.id}`}
                to={`/${m.type}/${m.id}`}
                className="border border-white/10 rounded-xl bg-black/30 overflow-hidden hover:bg-white/5 transition"
              >
                <img
                  src={m.poster ?? "/placeholder.svg"}
                  alt={m.title}
                  className="w-full aspect-[2/3] object-cover"
                />
                <div className="p-3">
                  <div className="text-sm font-semibold line-clamp-2">
                    {m.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {m.year} • ★ {m.rating.toFixed(1)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActorDetails;