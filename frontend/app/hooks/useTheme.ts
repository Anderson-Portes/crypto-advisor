"use client";
import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    const resolved = saved ?? "dark";
    setTheme(resolved);
    document.documentElement.dataset.theme = resolved === "light" ? "light" : "";
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next === "light" ? "light" : "";
    localStorage.setItem("theme", next);
  }

  return { theme, toggle };
}
