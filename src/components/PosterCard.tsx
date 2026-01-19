import { Star } from "lucide-react";

interface PosterCardProps {
  rank: number;
  title: string;
  rating: number;
  posterSrc: string;
  year?: string;
}

const PosterCard = ({ rank, title, rating, posterSrc, year }: PosterCardProps) => {
  return (
    <div className="poster-card group cursor-pointer relative pl-4 pt-4">
      {/* Rank Badge */}
      <div className="absolute left-0 top-0 z-10 w-10 h-10 flex items-center justify-center text-lg font-bold text-foreground bg-secondary rounded-full border-2 border-primary/50" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
        {rank}
      </div>
      
      {/* Poster Image */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
        <img 
          src={posterSrc} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient overlay always visible at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Content at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-300">
          <div className="space-y-2">
            <h3 className="text-foreground font-semibold text-sm md:text-base leading-tight line-clamp-2">
              {title}
            </h3>
            <div className="flex items-center gap-2">
              <div className="rating-badge">
                <Star className="w-3 h-3 fill-current" />
                <span>{rating === 0 ? "N/A" : rating.toFixed(1)}</span>
              </div>
              {year && (
                <span className="text-muted-foreground text-xs">{year}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosterCard;
