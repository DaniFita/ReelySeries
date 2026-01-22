import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWatchlist, removeFromWatchlist, type WatchlistItem } from "@/lib/watchlist";
import { useSeo } from "@/lib/seo";

const Watchlist = () => {
  const [items, setItems] = useState<WatchlistItem[]>([]);

  useSeo({
    title: "Watchlist • ReelySeries",
    description: "Your saved movies & TV series watchlist.",
  });

  useEffect(() => {
    setItems(getWatchlist());
  }, []);

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-12 lg:px-20 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">⭐ Watchlist</h1>
        <Link
          to="/"
          className="border border-white/15 rounded-lg px-4 py-2 bg-white/5 hover:bg-white/10 transition text-sm"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="mt-6 text-muted-foreground text-sm">
        Saved locally in your browser. (We can sync accounts later.)
      </div>

      {items.length === 0 ? (
        <div className="mt-8 text-muted-foreground">
          No items saved yet. Go add something legendary.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {items.map((m) => (
            <div
              key={`${m.type}-${m.id}`}
              className="border border-white/10 rounded-xl bg-black/30 overflow-hidden"
            >
              <Link to={`/${m.type}/${m.id}`}>
                <img
                  src={m.poster ?? "/placeholder.svg"}
                  alt={m.title}
                  className="w-full aspect-[2/3] object-cover"
                />
              </Link>

              <div className="p-3">
                <div className="text-sm font-semibold line-clamp-2">{m.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {m.year} • ★ {m.rating.toFixed(1)}
                </div>

                <button
                  onClick={() => {
                    const next = removeFromWatchlist(m.type, m.id);
                    setItems(next);
                  }}
                  className="mt-3 w-full border border-white/15 rounded-lg px-3 py-2 text-xs bg-white/5 hover:bg-white/10 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;