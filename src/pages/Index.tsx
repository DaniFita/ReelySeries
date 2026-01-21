import Header from "@/components/Header";
import RankingSection from "@/components/RankingSection";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { browseMovies, browseTV, searchMulti } from "@/data/mediaData";

type Lang = "en-US" | "ro-RO" | "es-ES" | "de-DE" | "fr-FR";
type Region = "RO" | "US" | "DE" | "FR" | "ES";
type Tab = "movies" | "tv";
type SortBy = "primary_release_date.desc" | "popularity.desc" | "vote_average.desc";

const UI = {
  "en-US": {
    movies: "Movies",
    tv: "TV Series",
    searchPlaceholder: "Search movies & TV...",
    newest: "Newest",
    mostViewed: "Most Viewed",
    bestRated: "Best Rated",
    browseMovies: "Browse Movies",
    browseTV: "Browse TV Series",
    searchResultsFor: (q: string) => `Search results for "${q}"`,
    resultsFromTMDB: "Results from TMDB",
    subtitleNewest: "Newest releases (2026+ vibes)",
    subtitlePopular: "Most viewed right now",
    subtitleRated: "Best rated (with enough votes)",
    loading: "Loading...",
    failed: "Failed to load data.",
    prev: "← Prev",
    next: "Next →",
    page: (p: number, total: number) => `Page ${p} / ${total}`,
    sortingDisabled: "Sorting disabled during search",
  },
  "ro-RO": {
    movies: "Filme",
    tv: "Seriale",
    searchPlaceholder: "Caută filme & seriale...",
    newest: "Cele mai noi",
    mostViewed: "Cele mai vizionate",
    bestRated: "Cel mai bun rating",
    browseMovies: "Explorează Filme",
    browseTV: "Explorează Seriale",
    searchResultsFor: (q: string) => `Rezultate pentru "${q}"`,
    resultsFromTMDB: "Rezultate din TMDB",
    subtitleNewest: "Cele mai noi apariții (2026+)",
    subtitlePopular: "Cele mai vizionate acum",
    subtitleRated: "Cele mai bune (cu suficiente voturi)",
    loading: "Se încarcă...",
    failed: "Nu s-au putut încărca datele.",
    prev: "← Înapoi",
    next: "Înainte →",
    page: (p: number, total: number) => `Pagina ${p} / ${total}`,
    sortingDisabled: "Sortarea este dezactivată în timpul căutării",
  },
  "es-ES": {
    movies: "Películas",
    tv: "Series",
    searchPlaceholder: "Buscar películas y series...",
    newest: "Más nuevas",
    mostViewed: "Más vistas",
    bestRated: "Mejor puntuación",
    browseMovies: "Explorar Películas",
    browseTV: "Explorar Series",
    searchResultsFor: (q: string) => `Resultados para "${q}"`,
    resultsFromTMDB: "Resultados de TMDB",
    subtitleNewest: "Estrenos más nuevos (2026+)",
    subtitlePopular: "Más vistas ahora",
    subtitleRated: "Mejor valoradas (con suficientes votos)",
    loading: "Cargando...",
    failed: "No se pudieron cargar los datos.",
    prev: "← Anterior",
    next: "Siguiente →",
    page: (p: number, total: number) => `Página ${p} / ${total}`,
    sortingDisabled: "Ordenación desactivada durante la búsqueda",
  },
  "de-DE": {
    movies: "Filme",
    tv: "Serien",
    searchPlaceholder: "Filme & Serien suchen...",
    newest: "Neueste",
    mostViewed: "Meistgesehen",
    bestRated: "Bestbewertet",
    browseMovies: "Filme entdecken",
    browseTV: "Serien entdecken",
    searchResultsFor: (q: string) => `Ergebnisse für "${q}"`,
    resultsFromTMDB: "Ergebnisse von TMDB",
    subtitleNewest: "Neueste Releases (2026+)",
    subtitlePopular: "Gerade am meisten gesehen",
    subtitleRated: "Bestbewertet (mit genug Stimmen)",
    loading: "Laden...",
    failed: "Daten konnten nicht geladen werden.",
    prev: "← Zurück",
    next: "Weiter →",
    page: (p: number, total: number) => `Seite ${p} / ${total}`,
    sortingDisabled: "Sortierung während der Suche deaktiviert",
  },
  "fr-FR": {
    movies: "Films",
    tv: "Séries",
    searchPlaceholder: "Rechercher films & séries...",
    newest: "Les plus récents",
    mostViewed: "Les plus vus",
    bestRated: "Meilleure note",
    browseMovies: "Explorer les Films",
    browseTV: "Explorer les Séries",
    searchResultsFor: (q: string) => `Résultats pour "${q}"`,
    resultsFromTMDB: "Résultats TMDB",
    subtitleNewest: "Sorties les plus récentes (2026+)",
    subtitlePopular: "Les plus vus actuellement",
    subtitleRated: "Les mieux notés (avec assez de votes)",
    loading: "Chargement...",
    failed: "Impossible de charger les données.",
    prev: "← Précédent",
    next: "Suivant →",
    page: (p: number, total: number) => `Page ${p} / ${total}`,
    sortingDisabled: "Tri désactivé pendant la recherche",
  },
} as const;

const Index = () => {
  const [language, setLanguage] = useState<Lang>("en-US");
  const [region, setRegion] = useState<Region>("RO");
  const [tab, setTab] = useState<Tab>("movies");

  const [sortBy, setSortBy] = useState<SortBy>("primary_release_date.desc");

  const [search, setSearch] = useState("");
  const isSearching = search.trim().length >= 2;

  const [page, setPage] = useState(1);

  const t = UI[language];

  const queryKey = useMemo(() => {
    if (isSearching) return ["search", search, page, language];
    return ["browse", tab, page, language, region, sortBy];
  }, [isSearching, search, tab, page, language, region, sortBy]);

  const { data, isLoading, error, isFetching } = useQuery({
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
    ? t.searchResultsFor(search.trim())
    : tab === "movies"
    ? t.browseMovies
    : t.browseTV;

  const subtitle = isSearching
    ? t.resultsFromTMDB
    : sortBy === "primary_release_date.desc"
    ? t.subtitleNewest
    : sortBy === "popularity.desc"
    ? t.subtitlePopular
    : t.subtitleRated;

  return (
    <div className="min-h-screen">
      <Header />

      {/* ✅ Sticky controls (mobile) */}
      <div className="sticky top-0 z-30 bg-black/60 backdrop-blur-xl border-b border-white/10 md:static md:bg-transparent md:border-b-0">
        <div className="px-4 sm:px-6 md:px-12 lg:px-20 pt-4 pb-4 md:pt-6 md:pb-0">
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
              className="border rounded-lg px-3 py-3 bg-transparent w-full md:w-[360px] text-base"
            />

            {/* Sort + Language + Region */}
            <div className="flex flex-wrap gap-2">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortBy);
                  setPage(1);
                }}
                className="border rounded-lg px-3 py-3 bg-transparent text-base"
                disabled={isSearching}
                title={isSearching ? t.sortingDisabled : ""}
              >
                <option value="primary_release_date.desc">{t.newest}</option>
                <option value="popularity.desc">{t.mostViewed}</option>
                <option value="vote_average.desc">{t.bestRated}</option>
              </select>

              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as Lang);
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
                  setRegion(e.target.value as Region);
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

          {/* small status line */}
          {isFetching && !isLoading && (
            <div className="pt-3 text-center text-xs text-muted-foreground">
              Updating…
            </div>
          )}

          {error && (
            <div className="pt-3 text-center text-red-500 text-sm">{t.failed}</div>
          )}
        </div>
      </div>

      {/* Results */}
      <RankingSection title={title} subtitle={subtitle} items={items} isLoading={isLoading} />

      {/* Pagination */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 pb-12 flex items-center justify-center gap-3">
        <button
          className="border rounded-lg px-4 py-3 disabled:opacity-40 text-base"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          {t.prev}
        </button>

        <div className="text-sm text-muted-foreground">{t.page(page, maxPages)}</div>

        <button
          className="border rounded-lg px-4 py-3 disabled:opacity-40 text-base"
          disabled={page >= maxPages}
          onClick={() => setPage((p) => p + 1)}
        >
          {t.next}
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default Index;