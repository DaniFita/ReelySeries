const KEY = "reely_clicks_v1";

type ClickEvent = {
  ts: number;
  type: "movie" | "tv";
  id: number;
  title: string;
  provider: string;
  url: string;
};

export function trackWatchClick(ev: Omit<ClickEvent, "ts">) {
  const event: ClickEvent = { ...ev, ts: Date.now() };

  try {
    const raw = localStorage.getItem(KEY);
    const list: ClickEvent[] = raw ? JSON.parse(raw) : [];
    list.unshift(event);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    // ignore
  }

  // useful in dev
  console.log("[TRACK] watch_click", event);
}