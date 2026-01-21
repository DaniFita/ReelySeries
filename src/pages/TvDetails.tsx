import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

type TMDBTvDetails = {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
  poster_path: string | null;
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function getToken(): string {
  const token = import.meta.env.VITE_TMDB_TOKEN as string | undefined;
  if (!token) {
    throw new Error("Missing VITE_TMDB_TOKEN. Check your .env.local and restart dev server.");
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

function yearFrom(date: string | undefined) {
  if (!date) return "—";
  return date.slice(0, 4) || "—";
}

export default function TvDetails() {
  const { id } = useParams();
  const tvId = Number(id);

  const { data, isLoading, error } = useQuery({
    queryKey: ["tvDetails", tvId],
    queryFn: () => tmdbFetch<TMDBTvDetails>(`/tv/${tvId}?language=en-US`),
    enabled: Number.isFinite(tvId),
  });

  if (!Number.isFinite(tvId)) {
    return (
      <div className="min-h-screen px-6 py-6">
        <Link to="/" className="underline text-muted-foreground">
          ← Back
        </Link>
        <p className="mt-4">Invalid TV ID.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen px-6 py-6">
        <p>Loading TV details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-6 py-6">
        <Link to="/" className="underline text-muted-foreground">
          ← Back
        </Link>
        <p className="mt-4 text-red-500 font-semibold">Failed to load TV show.</p>
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
            alt={data.name}
            className="w-full rounded-xl border"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            {data.name}{" "}
            <span className="text-muted-foreground">
              ({yearFrom(data.first_air_date)})
            </span>
          </h1>

          <div className="mt-2 text-muted-foreground">
            ⭐ {data.vote_average.toFixed(1)}
          </div>

          <p className="mt-4 leading-relaxed">
            {data.overview || "No description available."}
          </p>
        </div>
      </div>
    </div>
  );
}
