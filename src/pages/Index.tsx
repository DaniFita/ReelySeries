import Header from "@/components/Header";
import RankingSection from "@/components/RankingSection";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { browseMovies, browseTV, searchMulti } from "@/data/mediaData";

const Index = () => {
  const [language, setLanguage] = useState<
    "en-US" | "ro-RO" | "es-ES" | "de-DE" | "fr-FR"
  >("en-US");

  const [region, setRegion] = useState<"RO" | "US" | "DE" | "FR" | "ES">("RO");

  const [tab, setTab] = useState<"movies" | "tv">("movies");

  const [sortBy, setSortBy] = useState<
    "primary_release_date.desc" | "popularity.desc" | "vote_average.desc"
  >("primary_release_date.desc");

  const [search, setSearch] = useState("");
  const isSearching = search.trim().length >= 2;

  const [page, setPage] = useState(1);

  const queryKey = useMemo(() => {
    if (isSearching) return ["search", search, page, language];
    return ["browse", tab, page, language, region, sortBy];
  }, [isSearching, search, tab, page, language, region, sortBy]);

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (isSearching) {
        return searchMulti({ query: search.trim(), page, language });
      }
      if (tab === "movies") {
        return browseMovies({ page, language, region, sortBy });
      }
      return browseTV({ page, language, region, sortBy });
    },
    keepPreviousData: true,
  });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const maxPages = Math.min(totalPages, 500);

  const title = isSearching
    ? `Search results for "${search.trim()}"`
    : tab === "movies"
    ? "Browse Movies"
    : "Browse TV Series";

  const subtitle = isSearching
    ? "Results from TMDB"
    : sortBy === "primary_release_date.desc"
    ? "Newest releases (2026+ vibes)"
    : sortBy === "popularity.desc"
    ? "Most viewed right now"
    : "Best rated (with enough votes)";

  return (
    <div className="min-h-screen">
      <Header />

      {/* Controls */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 pt-5 sm:pt-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              className={`border rounded-lg px-3 py-3 text-base ${
                tab === "movies" ? "bg-white/10" : ""
              }`}
              onClick={() => {
                setTab("movies");
                setPage(1);
              }}
            >
              Movies
            </button>

            <button
              className={`border rounded-lg px-3 py-3 text-base ${
                tab === "tv" ? "bg-white/10" : ""
              }`}
              onClick={() => {
                setTab("tv");
                setPage(1);
              }}
            >
              TV Series
            </button>
          </div>

          {/* Search */}
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search movies & TV..."
            className="border rounded-lg px-3 py-3 bg-transparent w-full md:w-[360px] text-base"
          />

          {/* Sort + Language + Region */}
          <div className="flex flex-wrap gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              className="border rounded-lg px-3 py-3 bg-transparent text-base"
              disabled={isSearching}
              title={isSearching ? "Sorting disabled during search" : "Sort"}
            >
              <option value="primary_release_date.desc">Newest</option>
              <option value="popularity.desc">Most Viewed</option>
              <option value="vote_average.desc">Best Rated</option>
            </select>

            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value as any);
                setPage(1);
              }}
              className="border rounded-lg px-3 py-3 bg-transparent text-base"
            >
              <option value="ro-RO">Română</option>
              <option value="en-US">English</option>
              <option value="es-ES">Español</option>
              <option value="de-DE">Deutsch</option>
              <option value="fr-FR">Français</option>
            </select>

            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value as any);
                setPage(1);
              }}
              className="border rounded-lg px-3 py-3 bg-transparent text-base"
            >
              <option value="RO">RO</option>
              <option value="US">US</option>
              <option value="DE">DE</option>
              <option value="FR">FR</option>
              <option value="ES">ES</option>
            </select>
          </div>
        </div>

        {/* Status */}
        {isLoading && (
          <div className="py-4 text-center text-muted-foreground">Loading...</div>
        )}

        {error && (
          <div className="py-4 text-center text-red-500">
            Failed to load data.
          </div>
        )}
      </div>

      {/* Results */}
      <RankingSection title={title} subtitle={subtitle} items={items} />

      {/* Pagination */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 pb-12 flex items-center justify-center gap-3">
        <button
          className="border rounded-lg px-4 py-3 disabled:opacity-40 text-base"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          ← Prev
        </button>

        <div className="text-sm text-muted-foreground">
          Page {page} / {maxPages}
        </div>

        <button
          className="border rounded-lg px-4 py-3 disabled:opacity-40 text-base"
          disabled={page >= maxPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next →
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default Index;