import { useCallback, useEffect, useMemo, useState } from "react";

import ThemeContext from "./ThemeContextObject";

const STORAGE_KEY = "sbec_theme";

// ============================================================
// GET SYSTEM THEME
// ============================================================

const getSystemTheme = () => {
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function"
  ) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return "dark";
};

// ============================================================
// GET INITIAL THEME
// ============================================================

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return "dark";
  }

  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY);

    if (
      savedTheme === "dark" ||
      savedTheme === "light" ||
      savedTheme === "system"
    ) {
      return savedTheme;
    }
  } catch (error) {
    console.error("THEME STORAGE ERROR:", error);
  }

  return "dark";
};

// ============================================================
// APPLY THEME
// ============================================================

const applyTheme = (resolvedTheme) => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const body = document.body;

  root.setAttribute("data-sbec-theme", resolvedTheme);

  body.setAttribute("data-sbec-theme", resolvedTheme);

  root.style.colorScheme = resolvedTheme;
  body.style.colorScheme = resolvedTheme;
};

// ============================================================
// THEME PROVIDER
// ============================================================

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  // ==========================================================
  // SAVE + APPLY THEME
  // ==========================================================

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.error("THEME SAVE ERROR:", error);
    }

    applyTheme(resolvedTheme);
  }, [theme, resolvedTheme]);

  // ==========================================================
  // SYSTEM THEME LISTENER
  // ==========================================================

  useEffect(() => {
    if (
      theme !== "system" ||
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (event) => {
      applyTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme]);

  // ==========================================================
  // CHANGE THEME
  // IMPORTANT: useCallback keeps this function stable.
  // ==========================================================

  const changeTheme = useCallback((newTheme) => {
    if (!["dark", "light", "system"].includes(newTheme)) {
      return;
    }

    setTheme(newTheme);
  }, []);

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      changeTheme,
      isDark: resolvedTheme === "dark",
      isLight: resolvedTheme === "light",
    }),
    [theme, resolvedTheme, changeTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export default ThemeProvider;
