"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

export default function ThemeToggle({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      aria-pressed={isDark}
      className="flex items-center gap-4 py-3 px-6 text-secondary hover:text-primary hover:bg-surface-alt rounded-r-xl font-bold transition-all w-full"
    >
      <div
        className={`shrink-0 relative w-12 h-6 rounded-full transition-colors duration-300 ${
          isDark ? "bg-brand" : "bg-surface-muted"
        }`}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow-md flex items-center justify-center"
          style={{ left: isDark ? "calc(100% - 22px)" : "2px" }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.span
                key="moon"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
                className="flex"
              >
                <Moon size={12} className="text-brand" />
              </motion.span>
            ) : (
              <motion.span
                key="sun"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.15 }}
                className="flex"
              >
                <Sun size={12} className="text-muted" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      {!collapsed && (
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
      )}
    </button>
  );
}
