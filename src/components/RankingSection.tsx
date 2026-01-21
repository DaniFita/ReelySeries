import PosterCard from "./PosterCard";
import { useNavigate } from "react-router-dom";
import type { MediaItem } from "@/data/mediaData";

interface RankingSectionProps {
  title: string;
  subtitle?: string;
  items: MediaItem[];
}

const RankingSection = ({ title, subtitle, items }: RankingSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-20 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-6 sm:mb-10 space-y-2">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
        {items.map((item, index) => (
          <button
            key={`${item.type}-${item.id}`}
            type="button"
            onClick={() => navigate(`/${item.type}/${item.id}`)}
            className="animate-fade-up block w-full text-left cursor-pointer hover:scale-[1.02] transition-transform bg-transparent border-0 p-0 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-xl"
            style={{ animationDelay: `${(index % 10) * 60}ms` }}
          >
            <PosterCard
              rank={index + 1}
              title={item.title}
              rating={item.rating}
              posterSrc={item.poster ?? "/placeholder.svg"}
              year={item.year}
            />
          </button>
        ))}
      </div>
    </section>
  );
};

export default RankingSection;