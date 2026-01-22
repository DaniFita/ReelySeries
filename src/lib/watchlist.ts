import type { MediaItem } from "@/data/mediaData";

const KEY = "reely_watchlist_v1";

export type WatchlistItem = Pick<
  MediaItem,
  "id" | "type" | "title" | "year" | "rating" | "poster"
> & { addedAt: number };

export function getWatchlist(): WatchlistItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WatchlistItem[];
  } catch {
    return [];
  }
}

export function saveWatchlist(items: WatchlistItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function isInWatchlist(type: "movie" | "tv", id: number) {
  return getWatchlist().some((x) => x.type === type && x.id === id);
}

export function addToWatchlist(item: WatchlistItem) {
  const list = getWatchlist();
  const exists = list.some((x) => x.type === item.type && x.id === item.id);
  if (exists) return list;
  const next = [item, ...list];
  saveWatchlist(next);
  return next;
}

export function removeFromWatchlist(type: "movie" | "tv", id: number) {
  const list = getWatchlist();
  const next = list.filter((x) => !(x.type === type && x.id === id));
  saveWatchlist(next);
  return next;
}