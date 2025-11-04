import { useEffect, useState } from "react";
const KEY = "rr_favorites_v1";

export function useFavorites() {
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(favs)); }, [favs]);
  const addFavorite = (item) => setFavs(p => p.some(x => x.id === item.id) ? p : [...p, item]);
  const removeFavorite = (id) => setFavs(p => p.filter(x => x.id !== id));
  const isFavorite = (id) => favs.some(x => x.id === id);
  return { favs, addFavorite, removeFavorite, isFavorite };
}
