interface PosterCardProps {
  rank?: number;
  title: string;
  rating: number;
  posterSrc: string;
  year: string;
}

export default function PosterCard({
  rank,
  title,
  rating,
  posterSrc,
  year,
}: PosterCardProps) {
  const safeRating =
    typeof rating === "number" && Number.isFinite(rating) ? rating : 0;

  return (
    <div className="group relative">
      {/* Rank badge */}
      {typeof rank === "number" && (
        <div className="absolute -top-2 -left-2 z-10">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/80 border border-white/10 flex items-center justify-center text-xs sm:text-sm font-bold">
            {rank}
          </div>
        </div>
      )}

      {/* Poster */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30">
        <img
          src={posterSrc}
          alt={title}
          loading="lazy"
          className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {/* Bottom gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Rating pill */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/70 border border-white/10 px-2 py-1 text-xs">
          <span className="text-red-400">★</span>
          <span className="font-semibold">
            {safeRating > 0 ? safeRating.toFixed(1) : "N/A"}
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="mt-2 space-y-1">
        <div className="text-sm sm:text-base font-semibold line-clamp-2">
          {title}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">{year}</div>
      </div>
    </div>
  );
}