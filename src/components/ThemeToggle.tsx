"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex h-8 w-8 shadow-sm cursor-pointer items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 ring-gray-200 dark:ring-neutral-700 duration-300 hover:text-gray-900 dark:hover:text-white hover:ring-2 focus:outline-none active:scale-95 transition-all"
      title="Mudar Tema"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
