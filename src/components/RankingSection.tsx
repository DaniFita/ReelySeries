import PosterCard from "./PosterCard";
import { Link } from "react-router-dom";
import type { MediaItem } from "@/data/mediaData";

interface RankingSectionProps {
  title: string;
  subtitle?: string;
  items: MediaItem[];
}

const RankingSection = ({ title, subtitle, items }: RankingSectionProps) => {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-10">
      <div className="mb-6 space-y-1">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {items.slice(0, 10).map((item, index) => (
          <Link
            key={`${item.type}-${item.id}`}
            to={`/${item.type}/${item.id}`}
            className="animate-fade-up"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <PosterCard
              rank={index + 1}
              title={item.title}
              rating={item.rating}
              posterSrc={item.poster ?? "/placeholder.svg"}
              year={item.year}
            />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RankingSection;
