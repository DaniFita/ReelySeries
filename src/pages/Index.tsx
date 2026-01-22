import Header from "@/components/Header";
import RankingSection from "@/components/RankingSection";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  browseMovies,
  browseTV,
  searchEverything,
  type Category,
} from "@/data/mediaData";

type Lang = "en-US" | "ro-RO" | "es-ES" | "de-DE" | "fr-FR";
type Region = "RO" | "US" | "DE" | "FR" | "ES";
type Tab = "movies" | "tv";

const UI = {
  "en-US": {
    movies: "Movies",
    tv: "TV Series",
    searchPlaceholder: "Search movies, TV, actors, topics...",
    failed: "Failed to load data.",
    prev: "← Prev",
    next: "Next →",
    page: (p: number, total: number) => `Page ${p} / ${total}`,
  },
  "ro-RO": {
    movies: "Filme",
    tv: "Seriale",
    searchPlaceholder: "Caută filme, seriale, actori, subiecte...",
    failed: "Nu s-au putut încărca datele.",
    prev: "← Înapoi",
    next: "Înainte →",
    page: (p: number, total: number) => `Pagina ${p} / ${total}`,
  },
  "es-ES": {
    movies: "Películas",
    tv: "Series",
    searchPlaceholder: "Buscar películas, series, actores, temas...",
    failed: "No se pudieron cargar los datos.",
    prev: "← Anterior",
    next: "Siguiente →",
    page: (p: number, total: number) => `Página ${p} / ${total}`,
  },
  "de-DE": {
    movies: "Filme",
    tv: "Serien",
    searchPlaceholder: "Filme, Serien, Schauspieler, Themen suchen...",
    failed: "Daten konnten nicht geladen werden.",
    prev: "← Zurück",
    next: "Weiter →",
    page: (p: number, total: number) => `Seite ${p} / ${total}`,
  },
  "fr-FR": {
    movies: "Films",
    tv: "Séries",
    searchPlaceholder: "Rechercher films, séries, acteurs, thèmes...",
    failed: "Impossible de charger les données.",
    prev: "← Précédent",
    next: "Suivant →",
    page: (p: number, total: number) => `Page ${p} / ${total}`,
  },
} as const;

/**
 * ✅ Secțiunile homepage (una sub alta)
 * IMPORTANT:
 * - In Cinemas + Coming Soon apar doar pe Movies
 */
const SECTIONS: Array<{
  id: string;
  title: string;
  category: Category;
  moviesOnly?: boolean;
}> = [
  { id: "trending", title: "Trending this week", category: "trending" },
  { id: "newest", title: "Newest", category: "newest" },
  { id: "mostViewed", title: "Most Viewed", category: "mostViewed" },
  { id: "bestRated", title: "Best Rated", category: "bestRated" },

  { id: "inCinemas", title: "In Cinemas", category: "inCinemas", moviesOnly: true },
  { id: "comingSoon", title: "Coming Soon", category: "comingSoon", moviesOnly: true },

  { id: "netflix", title: "Netflix", category: "netflix" },
  { id: "max", title: "Max / HBO", category: "max" },
  { id: "disney", title: "Disney+", category: "disney" },
  { id: "prime", title: "Prime Video", category: "prime" },

  { id: "action", title: "Action", category: "action" },
  { id: "thriller", title: "Thriller", category: "thriller" },
  { id: "horror", title: "Horror", category: "horror" },
  { id: "comedy", title: "Comedy", category: "comedy" },
  { id: "drama", title: "Drama", category: "drama" },
  { id: "romance", title: "Romance", category: "romance" },
  { id: "sciFi", title: "Sci-Fi", category: "sciFi" },
  { id: "fantasy", title: "Fantasy", category: "fantasy" },
  { id: "crime", title: "Crime", category: "crime" },
  { id: "adventure", title: "Adventure", category: "adventure" },
];

const Index = () => {
  const [language, setLanguage] = useState<Lang>("ro-RO");
  const [region, setRegion] = useState<Region>("RO");
  const [tab, setTab] = useState<Tab>("movies");

  const [search, setSearch] = useState("");
  const isSearching = search.trim().length >= 2;
  const [page, setPage] = useState(1);

  const t = UI[language];

  const sectionsVisible = useMemo(() => {
    if (tab === "tv") {
      return SECTIONS.filter((s) => !s.moviesOnly);
    }
    return SECTIONS;
  }, [tab]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["searchEverything", search, page, language, region],
    queryFn: () => searchEverything({ query: search.trim(), page, language, region }),
    enabled: isSearching,
    keepPreviousData: true,
  });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const maxPages = Math.min(totalPages, 500);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* ✅ Sticky controls */}
      <div className="sticky top-0 z-30 bg-black/70 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 sm:px-6 md:px-12 lg:px-20 pt-4 pb-4 space-y-3">
          {/* Row 1: Tabs + Search + Lang + Region */}
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
                {t.movies}
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
                {t.tv}
              </button>
            </div>

            {/* Search */}
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t.searchPlaceholder}
              className="border rounded-lg px-3 py-3 bg-transparent w-full md:w-[420px] text-base"
            />

            {/* Lang + Region */}
            <div className="flex flex-wrap gap-2">
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as Lang);
                  setPage(1);
                }}
                className="border rounded-lg px-3 py-3 bg-black text-white text-base"
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
                  setRegion(e.target.value as Region);
                  setPage(1);
                }}
                className="border rounded-lg px-3 py-3 bg-black text-white text-base"
              >
                <option value="RO">RO</option>
                <option value="US">US</option>
                <option value="DE">DE</option>
                <option value="FR">FR</option>
                <option value="ES">ES</option>
              </select>
            </div>
          </div>

          {/* Row 2: Chips (NUMAI când NU căutăm) */}
          {!isSearching && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sectionsVisible.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="shrink-0 border border-white/15 rounded-full px-4 py-2 text-sm bg-white/5 hover:bg-white/10 transition"
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}

          {/* Status */}
          <div className="text-center text-xs text-muted-foreground">
            {isFetching && !isLoading ? "Updating…" : ""}
          </div>

          {error && (
            <div className="text-center text-red-500 text-sm">{t.failed}</div>
          )}
        </div>
      </div>

      {/* ✅ SEARCH MODE */}
      {isSearching ? (
        <>
          <RankingSection
            title={`Results for "${search.trim()}"`}
            subtitle="Movies + TV + Actors + Topics"
            items={items}
          />

          {/* Pagination */}
          <div className="px-4 sm:px-6 md:px-12 lg:px-20 pb-12 flex items-center justify-center gap-3">
            <button
              className="border rounded-lg px-4 py-3 disabled:opacity-40 text-base"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t.prev}
            </button>

            <div className="text-sm text-muted-foreground">
              {t.page(page, maxPages)}
            </div>

            <button
              className="border rounded-lg px-4 py-3 disabled:opacity-40 text-base"
              disabled={page >= maxPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t.next}
            </button>
          </div>

          <Footer />
        </>
      ) : (
        <>
          {/* ✅ HOME MODE: secțiuni una sub alta */}
          {sectionsVisible.map((s) => (
            <div key={s.id} id={s.id}>
              <SectionBlock
                tab={tab}
                language={language}
                region={region}
                category={s.category}
                title={s.title}
              />
            </div>
          ))}

          <Footer />
        </>
      )}
    </div>
  );
};

export default Index;

/** ✅ 1 secțiune = 1 query */
function SectionBlock(props: {
  tab: Tab;
  language: Lang;
  region: Region;
  category: Category;
  title: string;
}) {
  const { tab, language, region, category, title } = props;

  const q = useQuery({
    queryKey: ["section", tab, category, language, region],
    queryFn: async () => {
      if (tab === "movies") {
        return browseMovies({ page: 1, language, region, category });
      }
      return browseTV({ page: 1, language, region, category });
    },
    keepPreviousData: true,
  });

  return (
    <RankingSection
      title={title}
      subtitle={`${region} • ${language}`}
      items={(q.data?.items ?? []).slice(0, 10)}
    />
  );
}