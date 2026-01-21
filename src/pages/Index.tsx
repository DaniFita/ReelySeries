import Header from "@/components/Header";
import RankingSection from "@/components/RankingSection";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { getTopMovies, getTopSeries } from "@/data/mediaData";

const Index = () => {
  const {
    data: topMovies,
    isLoading: moviesLoading,
    error: moviesError,
  } = useQuery({
    queryKey: ["topMovies"],
    queryFn: getTopMovies,
  });

  const {
    data: topSeries,
    isLoading: seriesLoading,
    error: seriesError,
  } = useQuery({
    queryKey: ["topSeries"],
    queryFn: getTopSeries,
  });

  return (
    <div className="min-h-screen">
      <Header />

      {(moviesLoading || seriesLoading) && (
        <div className="px-6 py-4 text-center text-muted-foreground">
          Loading real data from TMDB...
        </div>
      )}

      {(moviesError || seriesError) && (
        <div className="px-6 py-4 text-center text-red-500">
          Failed to load TMDB data. Check your token.
        </div>
      )}

      <RankingSection
        title="Top 10 Movies"
        subtitle="The highest-rated films of 2024"
        items={topMovies ?? []}
      />

      <div className="flex justify-center px-6">
        <div className="w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <RankingSection
        title="Top 10 TV Series"
        subtitle="Binge-worthy shows dominating the rankings"
        items={topSeries ?? []}
      />

      <Footer />
    </div>
  );
};

export default Index;