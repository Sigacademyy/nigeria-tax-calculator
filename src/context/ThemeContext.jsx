import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY_THEME = "theme_preference";

export function ThemeProvider({ children }) {
  // Get initial theme from localStorage or system preference
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return true;
    }
    return false;
  };

  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    // Apply theme to body
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    
    // Save preference
    localStorage.setItem(STORAGE_KEY_THEME, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      // Only auto-switch if user hasn't set a preference
      if (!localStorage.getItem(STORAGE_KEY_THEME)) {
        setIsDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

