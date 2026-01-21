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
    <section className="px-6 md:px-12 lg:px-20 py-16">
      <div className="mb-10 space-y-2">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
        {items.slice(0, 5).map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              console.log("CLICK CARD:", item.type, item.id);
              navigate(`/${item.type}/${item.id}`);
            }}
            className="animate-fade-up block text-left cursor-pointer hover:scale-[1.02] transition-transform"
            style={{ animationDelay: `${index * 100}ms` }}
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

      {items.length > 5 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8 mt-8">
          {items.slice(5, 10).map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                console.log("CLICK CARD:", item.type, item.id);
                navigate(`/${item.type}/${item.id}`);
              }}
              className="animate-fade-up block text-left cursor-pointer hover:scale-[1.02] transition-transform"
              style={{ animationDelay: `${(index + 5) * 100}ms` }}
            >
              <PosterCard
                rank={index + 6}
                title={item.title}
                rating={item.rating}
                posterSrc={item.poster ?? "/placeholder.svg"}
                year={item.year}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default RankingSection;