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
    browseMovies: "Browse Movies",
    browseTV: "Browse TV Series",
    searchResultsFor: (q: string) => `Search results for "${q}"`,
    resultsFromTMDB: "Movies + TV + Actors + Keywords (TMDB)",
    failed: "Failed to load data.",
    prev: "← Prev",
    next: "Next →",
    page: (p: number, total: number) => `Page ${p} / ${total}`,
    sortingDisabled: "Filters disabled during search",
    updating: "Updating…",
    filters: "Filters",
    category: "Category",
  },
  "ro-RO": {
    movies: "Filme",
    tv: "Seriale",
    searchPlaceholder: "Caută filme, seriale, actori, subiecte...",
    browseMovies: "Explorează Filme",
    browseTV: "Explorează Seriale",
    searchResultsFor: (q: string) => `Rezultate pentru "${q}"`,
    resultsFromTMDB: "Filme + Seriale + Actori + Keywords (TMDB)",
    failed: "Nu s-au putut încărca datele.",
    prev: "← Înapoi",
    next: "Înainte →",
    page: (p: number, total: number) => `Pagina ${p} / ${total}`,
    sortingDisabled: "Filtrele sunt dezactivate în timpul căutării",
    updating: "Se actualizează…",
    filters: "Filtre",
    category: "Categorie",
  },
  "es-ES": {
    movies: "Películas",
    tv: "Series",
    searchPlaceholder: "Buscar películas, series, actores, temas...",
    browseMovies: "Explorar Películas",
    browseTV: "Explorar Series",
    searchResultsFor: (q: string) => `Resultados para "${q}"`,
    resultsFromTMDB: "Películas + Series + Actores + Keywords (TMDB)",
    failed: "No se pudieron cargar los datos.",
    prev: "← Anterior",
    next: "Siguiente →",
    page: (p: number, total: number) => `Página ${p} / ${total}`,
    sortingDisabled: "Filtros desactivados durante la búsqueda",
    updating: "Actualizando…",
    filters: "Filtros",
    category: "Categoría",
  },
  "de-DE": {
    movies: "Filme",
    tv: "Serien",
    searchPlaceholder: "Filme, Serien, Schauspieler, Themen suchen...",
    browseMovies: "Filme entdecken",
    browseTV: "Serien entdecken",
    searchResultsFor: (q: string) => `Ergebnisse für "${q}"`,
    resultsFromTMDB: "Filme + Serien + Schauspieler + Keywords (TMDB)",
    failed: "Daten konnten nicht geladen werden.",
    prev: "← Zurück",
    next: "Weiter →",
    page: (p: number, total: number) => `Seite ${p} / ${total}`,
    sortingDisabled: "Filter während der Suche deaktiviert",
    updating: "Aktualisieren…",
    filters: "Filter",
    category: "Kategorie",
  },
  "fr-FR": {
    movies: "Films",
    tv: "Séries",
    searchPlaceholder: "Rechercher films, séries, acteurs, thèmes...",
    browseMovies: "Explorer les Films",
    browseTV: "Explorer les Séries",
    searchResultsFor: (q: string) => `Résultats pour "${q}"`,
    resultsFromTMDB: "Films + Séries + Acteurs + Keywords (TMDB)",
    failed: "Impossible de charger les données.",
    prev: "← Précédent",
    next: "Suivant →",
    page: (p: number, total: number) => `Page ${p} / ${total}`,
    sortingDisabled: "Filtres désactivés pendant la recherche",
    updating: "Mise à jour…",
    filters: "Filtres",
    category: "Catégorie",
  },
} as const;

const CATEGORY_LABELS: Record<string, string> = {
  newest: "Newest",
  mostViewed: "Most Viewed",
  bestRated: "Best Rated",
  trending: "Trending",
  inCinemas: "In Cinemas",
  comingSoon: "Coming Soon",

  netflix: "Netflix",
  disney: "Disney+",
  max: "Max / HBO",
  prime: "Prime Video",

  action: "Action",
  thriller: "Thriller",
  horror: "Horror",
  comedy: "Comedy",
  drama: "Drama",
  romance: "Romance",
  sciFi: "Sci-Fi",
  fantasy: "Fantasy",
  crime: "Crime",
  adventure: "Adventure",
};

const Index = () => {
  const [language, setLanguage] = useState<Lang>("ro-RO");
  const [region, setRegion] = useState<Region>("RO");
  const [tab, setTab] = useState<Tab>("movies");

  const [category, setCategory] = useState<Category>("newest");

  const [search, setSearch] = useState("");
  const isSearching = search.trim().length >= 2;
  const [page, setPage] = useState(1);

  const t = UI[language];

  const queryKey = useMemo(() => {
    if (isSearching) return ["searchEverything", search, page, language, region];
    return ["browse", tab, page, language, region, category];
  }, [isSearching, search, tab, page, language, region, category]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      if (isSearching) {
        return searchEverything({ query: search.trim(), page, language, region });
      }

      if (tab === "movies") {
        return browseMovies({ page, language, region, category });
      }

      return browseTV({ page, language, region, category });
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

  const subtitle = isSearching ? t.resultsFromTMDB : "";

  return (
    <div className="min-h-screen">
      <Header />

      {/* Controls */}
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

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as Category);
                  setPage(1);
                }}
                className="border rounded-lg px-3 py-3 bg-black text-white text-base"
                disabled={isSearching}
                title={isSearching ? t.sortingDisabled : ""}
              >
                <optgroup label="Core">
                  <option value="newest">Newest</option>
                  <option value="mostViewed">Most Viewed</option>
                  <option value="bestRated">Best Rated</option>
                  <option value="trending">Trending</option>
                  {tab === "movies" && (
                    <>
                      <option value="inCinemas">In Cinemas</option>
                      <option value="comingSoon">Coming Soon</option>
                    </>
                  )}
                </optgroup>

                <optgroup label="Streaming">
                  <option value="netflix">Netflix</option>
                  <option value="max">Max / HBO</option>
                  <option value="disney">Disney+</option>
                  <option value="prime">Prime Video</option>
                </optgroup>

                <optgroup label="Genres">
                  <option value="action">Action</option>
                  <option value="thriller">Thriller</option>
                  <option value="horror">Horror</option>
                  <option value="comedy">Comedy</option>
                  <option value="drama">Drama</option>
                  <option value="romance">Romance</option>
                  <option value="sciFi">Sci-Fi</option>
                  <option value="fantasy">Fantasy</option>
                  <option value="crime">Crime</option>
                  <option value="adventure">Adventure</option>
                </optgroup>
              </select>

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

          {/* status */}
          <div className="pt-3 text-center text-xs text-muted-foreground">
            {!isSearching && (
              <span>
                {CATEGORY_LABELS[category] ?? "Category"} • {region} • {language}
              </span>
            )}
            {isFetching && !isLoading && (
              <span className="ml-2">{t.updating}</span>
            )}
          </div>

          {error && (
            <div className="pt-2 text-center text-red-500 text-sm">
              {t.failed}
            </div>
          )}
        </div>
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
    </div>
  );
};

export default Index;