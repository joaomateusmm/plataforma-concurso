"use client";

import { Bell } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type Update = {
  id: string;
  version: string;
  title: string;
  description: string;
  createdAt: Date;
};

export default function UpdatesNotification() {
  const [updates] = useState<Update[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && updates.length > 0) {
      setUnreadCount(0);
      localStorage.setItem(
        "swordtools_last_seen_update",
        new Date().toISOString(),
      );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative flex h-8 w-8 shadow-sm cursor-pointer items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 ring-gray-200 dark:ring-neutral-700 duration-300 hover:text-gray-900 dark:hover:text-white hover:ring-2 focus:outline-none active:scale-95 transition-all"
      >
        <Bell className="h-3.5 w-3.5" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#009966] dark:bg-neutral-100 text-[10px] font-bold text-white dark:text-black shadow-[0_0_10px_rgba(0,153,102,0.5)] dark:shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-colors duration-300">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div
          className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-100 mt-2 w-80 origin-top-right rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-2 shadow-2xl transition-colors duration-300"
          data-lenis-prevent="true"
        >
          <div className="mb-2 flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 px-3 py-2 transition-colors duration-300">
            <h3 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
              Changelog
            </h3>
            <span className="text-xs text-gray-500 dark:text-neutral-500 transition-colors duration-300">
              Last Updates
            </span>
          </div>

          {/* ÁREA COM SCROLL ATIVO */}
          <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 dark:scrollbar-thumb-neutral-800 max-h-87.5 overflow-y-auto overscroll-contain pr-1 transition-colors duration-300">
            {updates.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-neutral-500 transition-colors duration-300">
                Nenhuma atualização recente.
              </div>
            ) : (
              // Envolve a lista em uma div com padding bottom extra para o último item não colar no fundo
              <div className="flex flex-col gap-2 pb-2">
                {updates.map((update) => (
                  <div
                    key={update.id}
                    className="flex flex-col rounded-lg p-3 transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-neutral-900/50"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded bg-indigo-50 dark:bg-indigo-400/10 px-2 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 transition-colors duration-300">
                        {update.version}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-neutral-500 transition-colors duration-300">
                        {new Date(update.createdAt).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-neutral-200 transition-colors duration-300">
                      {update.title}
                    </h4>
                    <p className="text-xs leading-relaxed text-gray-600 dark:text-neutral-400 transition-colors duration-300">
                      {update.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
