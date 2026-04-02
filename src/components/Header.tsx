// src/components/Header.tsx
"use client";

import UserNav from "./UserNav";

export default function Header() {
  return (
    // Usa "sticky", retira a margin-top (mt-9) que podia estar a colidir,
    // e garante um z-index menor que o menu dropdown para não o cortar.
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-end border-b border-neutral-800 bg-neutral-950/60 px-6 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center gap-4">
        <UserNav />
      </div>
    </header>
  );
}
