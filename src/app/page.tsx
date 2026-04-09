"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const SpiralGallery = dynamic(() => import("@/components/SpiralGallery"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      <p className="text-gray-500 animate-pulse font-medium">
        Carregando Galeria 3D...
      </p>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden relative">
      <main className="flex flex-col items-center justify-start pt-24 px-8 z-10 relative">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 text-center max-w-3xl leading-tight">
          Acelere a sua <span className="text-green-600">Aprovação</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 mb-10 text-center max-w-2xl">
          Acelere a construção do seu conhecimento com simulados inteligentes e
          materiais de alto nível. Uma experiência de estudo impecável.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link href="/aluno">
            <button className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 hover:-translate-y-0.5">
              Área do Aluno
            </button>
          </Link>

          <Link href="/admin">
            <button className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-black transition-all shadow-lg hover:-translate-y-0.5">
              Painel Admin
            </button>
          </Link>
        </div>
      </main>

      <div className="relative w-full h-130 -translate-y-12">
        <div className="absolute inset-0 bg-green-400/10 blur-[120px] rounded-full scale-150 translate-y-1/3"></div>

        <SpiralGallery
          showText={true}
          bend={4.5}
          textColor="#101828"
          borderRadius={0.1}
          autoSpeed={0.013}
          startIndex={4}
        />
      </div>
    </div>
  );
}
