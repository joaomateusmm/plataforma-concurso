// src/app/page.tsx

import Link from "next/link";

export default function Home() {
  return (
    // O container principal agora ocupa a tela toda (min-h-screen), mas sem p-24 e justify-center
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex flex-1 flex-col  items-center justify-center p-8">
        {/* Título principal da plataforma */}
        <h1 className="text-4xl font-bold text-green-600 mb-4 text-center">
          Plataforma de Aprovação
        </h1>

        {/* Subtítulo explicando a metodologia */}
        <p className="text-lg text-gray-700 mb-8 text-center">
          Futura Landing Page
        </p>

        {/* Container para os nossos botões de navegação inicial */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Botão que futuramente levará ao painel do aluno */}
          <Link href="/aluno">
            {" "}
            {/* <-- Link atualizado para a futura área do aluno */}
            <button className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
              Área do Aluno
            </button>
          </Link>

          {/* Botão que leva ao painel de administração (inserção de questões) */}
          <Link href="/admin">
            <button className="w-full sm:w-auto px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors">
              Painel Admin
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
