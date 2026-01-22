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
    resultsTitle: (q: string) => `Results for "${q}"`,
    resultsSubtitle: "Movies + TV + Actors + Topics",
    updating: "Updating…",
    sections: {
      trending: "Trending this week",
      newest: "Newest",
      mostViewed: "Most Viewed",
      bestRated: "Best Rated",
      inCinemas: "In Cinemas",
      comingSoon: "Coming Soon",
      netflix: "Netflix",
      max: "Max / HBO",
      disney: "Disney+",
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
    },
  },

  "ro-RO": {
    movies: "Filme",
    tv: "Seriale",
    searchPlaceholder: "Caută filme, seriale, actori, subiecte...",
    failed: "Nu s-au putut încărca datele.",
    prev: "← Înapoi",
    next: "Înainte →",
    page: (p: number, total: number) => `Pagina ${p} / ${total}`,
    resultsTitle: (q: string) => `Rezultate pentru "${q}"`,
    resultsSubtitle: "Filme + Seriale + Actori + Subiecte",
    updating: "Se actualizează…",
    sections: {
      trending: "Trend săptămâna asta",
      newest: "Cele mai noi",
      mostViewed: "Cele mai vizionate",
      bestRated: "Cel mai bun rating",
      inCinemas: "În cinema",
      comingSoon: "În curând",
      netflix: "Netflix",
      max: "Max / HBO",
      disney: "Disney+",
      prime: "Prime Video",
      action: "Acțiune",
      thriller: "Thriller",
      horror: "Horror",
      comedy: "Comedie",
      drama: "Dramă",
      romance: "Romantic",
      sciFi: "Sci-Fi",
      fantasy: "Fantasy",
      crime: "Crimă",
      adventure: "Aventură",
    },
  },

  "es-ES": {
    movies: "Películas",
    tv: "Series",
    searchPlaceholder: "Buscar películas, series, actores, temas...",
    failed: "No se pudieron cargar los datos.",
    prev: "← Anterior",
    next: "Siguiente →",
    page: (p: number, total: number) => `Página ${p} / ${total}`,
    resultsTitle: (q: string) => `Resultados para "${q}"`,
    resultsSubtitle: "Películas + Series + Actores + Temas",
    updating: "Actualizando…",
    sections: {
      trending: "Tendencias de la semana",
      newest: "Más nuevas",
      mostViewed: "Más vistas",
      bestRated: "Mejor puntuación",
      inCinemas: "En cines",
      comingSoon: "Próximamente",
      netflix: "Netflix",
      max: "Max / HBO",
      disney: "Disney+",
      prime: "Prime Video",
      action: "Acción",
      thriller: "Thriller",
      horror: "Terror",
      comedy: "Comedia",
      drama: "Drama",
      romance: "Romance",
      sciFi: "Ciencia ficción",
      fantasy: "Fantasía",
      crime: "Crimen",
      adventure: "Aventura",
    },
  },

  "de-DE": {
    movies: "Filme",
    tv: "Serien",
    searchPlaceholder: "Filme, Serien, Schauspieler, Themen suchen...",
    failed: "Daten konnten nicht geladen werden.",
    prev: "← Zurück",
    next: "Weiter →",
    page: (p: number, total: number) => `Seite ${p} / ${total}`,
    resultsTitle: (q: string) => `Ergebnisse für "${q}"`,
    resultsSubtitle: "Filme + Serien + Schauspieler + Themen",
    updating: "Aktualisieren…",
    sections: {
      trending: "Trending diese Woche",
      newest: "Neueste",
      mostViewed: "Meistgesehen",
      bestRated: "Bestbewertet",
      inCinemas: "Im Kino",
      comingSoon: "Demnächst",
      netflix: "Netflix",
      max: "Max / HBO",
      disney: "Disney+",
      prime: "Prime Video",
      action: "Action",
      thriller: "Thriller",
      horror: "Horror",
      comedy: "Komödie",
      drama: "Drama",
      romance: "Romantik",
      sciFi: "Sci-Fi",
      fantasy: "Fantasy",
      crime: "Krimi",
      adventure: "Abenteuer",
    },
  },

  "fr-FR": {
    movies: "Films",
    tv: "Séries",
    searchPlaceholder: "Rechercher films, séries, acteurs, thèmes...",
    failed: "Impossible de charger les données.",
    prev: "← Précédent",
    next: "Suivant →",
    page: (p: number, total: number) => `Page ${p} / ${total}`,
    resultsTitle: (q: string) => `Résultats pour "${q}"`,
    resultsSubtitle: "Films + Séries + Acteurs + Thèmes",
    updating: "Mise à jour…",
    sections: {
      trending: "Tendances de la semaine",
      newest: "Les plus récents",
      mostViewed: "Les plus vus",
      bestRated: "Meilleure note",
      inCinemas: "Au cinéma",
      comingSoon: "À venir",
      netflix: "Netflix",
      max: "Max / HBO",
      disney: "Disney+",
      prime: "Prime Video",
      action: "Action",
      thriller: "Thriller",
      horror: "Horreur",
      comedy: "Comédie",
      drama: "Drame",
      romance: "Romance",
      sciFi: "Sci-Fi",
      fantasy: "Fantasy",
      crime: "Crime",
      adventure: "Aventure",
    },
  },
} as const;

const SECTION_DEFS: Array<{
  id: string;
  category: Category;
  labelKey: keyof typeof UI["en-US"]["sections"];
  moviesOnly?: boolean;
}> = [
  { id: "trending", category: "trending", labelKey: "trending" },
  { id: "newest", category: "newest", labelKey: "newest" },
  { id: "mostViewed", category: "mostViewed", labelKey: "mostViewed" },
  { id: "bestRated", category: "bestRated", labelKey: "bestRated" },

  { id: "inCinemas", category: "inCinemas", labelKey: "inCinemas", moviesOnly: true },
  { id: "comingSoon", category: "comingSoon", labelKey: "comingSoon", moviesOnly: true },

  { id: "netflix", category: "netflix", labelKey: "netflix" },
  { id: "max", category: "max", labelKey: "max" },
  { id: "disney", category: "disney", labelKey: "disney" },
  { id: "prime", category: "prime", labelKey: "prime" },

  { id: "action", category: "action", labelKey: "action" },
  { id: "thriller", category: "thriller", labelKey: "thriller" },
  { id: "horror", category: "horror", labelKey: "horror" },
  { id: "comedy", category: "comedy", labelKey: "comedy" },
  { id: "drama", category: "drama", labelKey: "drama" },
  { id: "romance", category: "romance", labelKey: "romance" },
  { id: "sciFi", category: "sciFi", labelKey: "sciFi" },
  { id: "fantasy", category: "fantasy", labelKey: "fantasy" },
  { id: "crime", category: "crime", labelKey: "crime" },
  { id: "adventure", category: "adventure", labelKey: "adventure" },
];

const Index = () => {
  const [language, setLanguage] = useState<Lang>("ro-RO");
  const [region, setRegion] = useState<Region>("RO");
  const [tab, setTab] = useState<Tab>("movies");

  const [search, setSearch] = useState("");
  const isSearching = search.trim().length >= 2;
  const [page, setPage] = useState(1);

  const t = UI[language];

  const visibleSections = useMemo(() => {
    if (tab === "tv") return SECTION_DEFS.filter((s) => !s.moviesOnly);
    return SECTION_DEFS;
  }, [tab]);

  const searchQuery = useQuery({
    queryKey: ["searchEverything", search, page, language, region],
    queryFn: () => searchEverything({ query: search.trim(), page, language, region }),
    enabled: isSearching,
    keepPreviousData: true,
  });

  const items = searchQuery.data?.items ?? [];
  const totalPages = searchQuery.data?.totalPages ?? 1;
  const maxPages = Math.min(totalPages, 500);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Sticky controls */}
      <div className="sticky top-0 z-30 bg-black/70 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 sm:px-6 md:px-12 lg:px-20 pt-4 pb-4 space-y-3">
          {/* Row 1 */}
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

          {/* Row 2: Chips */}
          {!isSearching && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {visibleSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="shrink-0 border border-white/15 rounded-full px-4 py-2 text-sm bg-white/5 hover:bg-white/10 transition"
                >
                  {t.sections[s.labelKey]}
                </button>
              ))}
            </div>
          )}

          {/* Status */}
          <div className="text-center text-xs text-muted-foreground">
            {searchQuery.isFetching && !searchQuery.isLoading ? t.updating : ""}
          </div>

          {searchQuery.error && (
            <div className="text-center text-red-500 text-sm">{t.failed}</div>
          )}
        </div>
      </div>

      {/* SEARCH MODE */}
      {isSearching ? (
        <>
          <RankingSection
            title={t.resultsTitle(search.trim())}
            subtitle={t.resultsSubtitle}
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
          {/* HOME SECTIONS */}
          {visibleSections.map((s) => (
            <div key={s.id} id={s.id}>
              <SectionBlock
                tab={tab}
                language={language}
                region={region}
                category={s.category}
                title={t.sections[s.labelKey]}
                subtitle={`${region} • ${language}`}
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

/** 1 section = 1 query */
function SectionBlock(props: {
  tab: Tab;
  language: Lang;
  region: Region;
  category: Category;
  title: string;
  subtitle: string;
}) {
  const { tab, language, region, category, title, subtitle } = props;

  const q = useQuery({
    queryKey: ["section", tab, category, language, region],
    queryFn: async () => {
      if (tab === "movies") return browseMovies({ page: 1, language, region, category });
      return browseTV({ page: 1, language, region, category });
    },
    keepPreviousData: true,
  });

  return (
    <RankingSection
      title={title}
      subtitle={subtitle}
      items={(q.data?.items ?? []).slice(0, 10)}
    />
  );
}