import Header from "@/components/Header";
import RankingSection from "@/components/RankingSection";
import Footer from "@/components/Footer";
import { topMovies, topSeries } from "@/data/mediaData";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />
      
      {/* Top Movies */}
      <RankingSection 
        title="Top 10 Movies"
        subtitle="The highest-rated films of 2024"
        items={topMovies}
      />
      
      {/* Divider */}
      <div className="flex justify-center px-6">
        <div className="w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
      
      {/* Top Series */}
      <RankingSection 
        title="Top 10 TV Series"
        subtitle="Binge-worthy shows dominating the rankings"
        items={topSeries}
      />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
