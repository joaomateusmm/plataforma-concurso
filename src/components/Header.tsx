// src/components/Header.tsx
"use client";

import UserNav from "./UserNav"; // Ajuste o caminho de importação se necessário

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-14 mt-9 w-full items-center justify-end border-b border-neutral-800 bg-neutral-950/60 px-6 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center gap-4">
        <UserNav />
      </div>
    </header>
  );
}
