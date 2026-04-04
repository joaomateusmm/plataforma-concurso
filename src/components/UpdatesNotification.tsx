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
  const [updates, setUpdates] = useState<Update[]>([]);
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
      {/* BOTÃO DO SINO */}
      <button
        onClick={handleToggle}
        className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-neutral-400 ring-neutral-700 duration-300 hover:text-white hover:ring-2 focus:outline-none active:scale-95"
      >
        <Bell className="h-3 w-3" />

        {/* BOLINHA DE NOTIFICAÇÃO (BADGE) COM LIMITE DE 9 */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-bold text-black shadow-[0_0_10px_rgba(99,102,241,0.5)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div
          className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-[100] mt-2 w-80 origin-top-right rounded-xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl"
          data-lenis-prevent="true"
        >
          <div className="mb-2 flex items-center justify-between border-b border-neutral-800 px-3 py-2">
            <h3 className="font-semibold text-white">Changelog</h3>
            <span className="text-xs text-neutral-500">Last Updates</span>
          </div>

          {/* ÁREA COM SCROLL ATIVO */}
          <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-800 max-h-[350px] overflow-y-auto overscroll-contain pr-1">
            {updates.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-500">
                Nenhuma atualização recente.
              </div>
            ) : (
              // Envolve a lista em uma div com padding bottom extra para o último item não colar no fundo
              <div className="flex flex-col gap-2 pb-2">
                {updates.map((update) => (
                  <div
                    key={update.id}
                    className="flex flex-col rounded-lg p-3 transition-colors hover:bg-neutral-900/50"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded bg-indigo-400/10 px-2 py-0.5 text-xs font-bold text-indigo-400">
                        {update.version}
                      </span>
                      <span className="text-[10px] text-neutral-500">
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
                    <h4 className="mb-2 text-sm font-medium text-neutral-200">
                      {update.title}
                    </h4>
                    <p className="text-xs leading-relaxed text-neutral-400">
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
