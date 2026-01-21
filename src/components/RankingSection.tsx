import PosterCard from "./PosterCard";
import { useNavigate } from "react-router-dom";
import type { MediaItem } from "@/data/mediaData";

interface RankingSectionProps {
  title: string;
  subtitle?: string;
  items: MediaItem[];
  isLoading?: boolean;
  skeletonCount?: number;
}

const RankingSection = ({
  title,
  subtitle,
  items,
  isLoading = false,
  skeletonCount = 10,
}: RankingSectionProps) => {
  const navigate = useNavigate();

  const showSkeleton = isLoading && items.length === 0;

  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-20 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-6 sm:mb-10 space-y-2">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
        {showSkeleton &&
          Array.from({ length: skeletonCount }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="animate-fade-up"
              style={{ animationDelay: `${(idx % 10) * 40}ms` }}
            >
              <div className="rounded-xl border border-white/10 overflow-hidden bg-black/30">
                <div className="w-full aspect-[2/3] animate-pulse bg-white/5" />
                <div className="p-2 space-y-2">
                  <div className="h-4 w-4/5 animate-pulse bg-white/5 rounded" />
                  <div className="h-3 w-2/5 animate-pulse bg-white/5 rounded" />
                </div>
              </div>
            </div>
          ))}

        {!showSkeleton &&
          items.map((item, index) => (
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