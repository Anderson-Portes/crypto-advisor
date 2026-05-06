"use client";
import { useEffect, useState } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  function toggle(id: string) {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem("favorites", JSON.stringify(next));
      return next;
    });
  }

  return { favorites, toggle };
}
