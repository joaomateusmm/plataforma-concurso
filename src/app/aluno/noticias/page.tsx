// src/app/page.tsx
"use client";

import { NotepadText } from "lucide-react";

export default function NoticiasPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 mt-6 mb-12 animate-in fade-in ">
      {/* CABEÇALHO HERO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <NotepadText className="w-8 h-8 text-emerald-500" />
            Noticias
          </h1>
          <p className="text-neutral-400">
            Fique por dentro de todas as notícias dos próximos editais.
          </p>
        </div>
      </div>
    </div>
  );
}
