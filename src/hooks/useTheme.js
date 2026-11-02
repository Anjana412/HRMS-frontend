// src/hooks/useTheme.js
import { useEffect, useState } from "react";

const LIGHT = {
  "--bg-main":       "#F1F5F9",
  "--bg-card":       "#ffffff",
  "--bg-sidebar":    "#ffffff",
  "--text-primary":  "#0f172a",
  "--text-secondary":"#64748b",
  "--border-color":  "#e2e8f0",
  "--nav-bg":        "#ffffff",
};

const DARK = {
  "--bg-main":       "#0f172a",
  "--bg-card":       "#1e293b",
  "--bg-sidebar":    "#1e293b",
  "--text-primary":  "#f1f5f9",
  "--text-secondary":"#94a3b8",
  "--border-color":  "#334155",
  "--nav-bg":        "#1e293b",
};

const applyTheme = (t) => {
  const isDark =
    t === "dark" ||
    (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const vars = isDark ? DARK : LIGHT;
  const root = document.documentElement;

  Object.entries(vars).forEach(([key, val]) => root.style.setProperty(key, val));

  // also set a data attribute so you can target it in CSS if needed
  root.setAttribute("data-theme", isDark ? "dark" : "light");
};

export const useTheme = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  return { theme, setTheme };
};

// Call this once on app startup (in main.jsx or App.jsx) so theme loads before render
export const initTheme = () => {
  const saved = localStorage.getItem("theme") || "system";
  applyTheme(saved);
};