"use client";

import Link from "next/link";
import { Mail, LayoutDashboard, PlayCircle, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import FloatingHeroImages from "@/components/FloatingHeroImages";
import BackgroundDoodles from "@/components/BackgroundDoodles";
import { RevealBlockText } from "@/components/ui/RevealBlockText";
import RotatingText from "@/components/RotatingText";

function useElementSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}

function SmoothWidthContainer({ children }: { children: React.ReactNode }) {
  const [ref, bounds] = useElementSize();
  return (
    <motion.div
      animate={{ width: bounds.width > 0 ? bounds.width : "auto" }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="overflow-hidden"
    >
      <div ref={ref} className="w-fit">
        {children}
      </div>
    </motion.div>
  );
}

export default function Home() {
  const avatares = [
    { id: 1, src: "/estudantes/img1.webp", zIndex: 10 },
    { id: 2, src: "/estudantes/img2.webp", zIndex: 20 },
    { id: 3, src: "/estudantes/img3.webp", zIndex: 30 },
    { id: 4, src: "/estudantes/img4.webp", zIndex: 40 },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] text-[#1A1A1A] dark:text-neutral-200 font-sans overflow-x-hidden relative transition-colors duration-300">
      <Navbar />

      <FloatingHeroImages />

      {/* Adicionado 'relative' e 'z-10' para isolar as animações de fundo */}
      <main className="max-w-7xl mx-auto pt-16 pb-24 px-6 text-center relative z-10">
        {/* INSERINDO OS RABISCOS AQUI */}
        <BackgroundDoodles />

        <div className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-neutral-200 leading-tight relative z-20 transition-colors duration-300">
          <div className="flex items-center justify-center flex-wrap">
            <RevealBlockText boxColor="#009966" delay={0.2}>
              <span className="mr-4">A sua aprovação</span>
            </RevealBlockText>

            <motion.div
              initial={{ opacity: 0, width: 0, scale: 0.5 }}
              animate={{ opacity: 1, width: "auto", scale: 1 }}
              transition={{
                duration: 1.5,
                delay: 1.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-center justify-center overflow-visible"
            >
              <motion.div
                className="flex items-center mr-4 cursor-pointer"
                initial="rest"
                whileHover="hover"
              >
                {avatares.map((avatar, index) => (
                  <motion.div
                    key={avatar.id}
                    className="relative"
                    style={{ zIndex: avatar.zIndex }}
                    variants={{
                      rest: { marginLeft: index === 0 ? 0 : -20 },
                      hover: { marginLeft: index === 0 ? 0 : -10 },
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 45 }}
                  >
                    <motion.img
                      className="w-14 h-14 md:w-17 md:h-17 rounded-full border-4 border-[#F8F9FA] dark:border-[#0a0a0a] object-cover bg-[#F8F9FA] dark:bg-[#0a0a0a] transition-colors duration-300"
                      src={avatar.src}
                      alt={`Aluno ${avatar.id}`}
                      whileHover={{ scale: 1.15, zIndex: 50 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <RevealBlockText boxColor="#009966" delay={0.2}>
              começa
            </RevealBlockText>
          </div>

          <div className="mt-2 flex items-center justify-center w-full overflow-hidden py-2">
            <RevealBlockText boxColor="#009966" delay={0.6}>
              <div className="flex flex-row items-center justify-center gap-3">
                <span>com a</span>

                <SmoothWidthContainer>
                  <RotatingText
                    texts={["preparação", "disciplina", "mentalidade"]}
                    mainClassName="text-[#009966]"
                    staggerFrom={"last"}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.035}
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={5000}
                  />
                </SmoothWidthContainer>

                <span>certa.</span>
              </div>
            </RevealBlockText>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4, ease: "easeInOut" }}
          className="text-gray-500 dark:text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed mt-4 relative z-20 transition-colors duration-300"
        >
          Chega de estudar sem direção. Tenha acesso ao ecossistema definitivo
          de estudos com ferramentas inteligentes que organizam sua rotina e
          aceleram sua aprovação.
        </motion.p>

        {/* Input de E-mail */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-16 relative z-20">
          <div className="relative w-full">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 transition-colors duration-300"
              size={18}
            />
            <input
              type="email"
              placeholder="Qual o seu melhor e-mail?"
              className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#009966]/20 transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-neutral-500"
            />
          </div>
          <button className="w-full sm:w-auto bg-[#009966] text-white px-8 py-4 rounded-full font-bold hover:bg-[#059669] transition-all whitespace-nowrap">
            Quero minha Aprovação
          </button>
        </div>

        {/* Mockup Central de Imagem */}
        <div className="relative w-full max-w-4xl mx-auto mt-10 z-20">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-neutral-800 aspect-video flex items-center justify-center relative transition-colors duration-300">
            <div className="absolute inset-0 bg-linear-to-tr from-gray-100 dark:from-neutral-800/50 to-transparent opacity-50" />
            <PlayCircle size={80} className="text-[#009966] opacity-80 z-10" />
            <div className="absolute bottom-6 left-6 text-left z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 transition-colors duration-300">
                Resolução de Questões
              </p>
              <p className="text-lg font-semibold text-gray-700 dark:text-neutral-200 transition-colors duration-300">
                Gabaritando Direito Constitucional
              </p>
            </div>
          </div>

          <div className="absolute -right-4 -top-4 hidden lg:block w-48 bg-white dark:bg-neutral-900 p-4 rounded-2xl shadow-lg border border-gray-50 dark:border-neutral-800 transform rotate-3 transition-colors duration-300">
            <BarChart3 className="text-blue-500 mb-2" />
            <p className="text-xs font-bold dark:text-neutral-200">
              Seu Desempenho
            </p>
            <div className="h-2 w-full bg-gray-100 dark:bg-neutral-800 rounded-full mt-2 transition-colors duration-300">
              <div className="h-2 w-[85%] bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </main>

      {/* --- 4. SEÇÃO DE FEEDBACKS --- */}
      <section className="bg-white dark:bg-[#0f0f0f] py-20 px-6 relative z-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="bg-[#009966] text-white p-8 rounded-[40px] flex flex-col justify-between min-h-75">
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-full mb-4" />
              <p className="font-medium text-lg italic">
                &quot;O controle de editais e os simulados me deram a confiança
                que faltava. Finalmente vi meu nome no Diário Oficial!&quot;
              </p>
            </div>
            <p className="font-bold">
              Ana Silva •{" "}
              <span className="font-normal opacity-80">Analista do TJ</span>
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-neutral-900 p-8 rounded-[40px] border border-gray-100 dark:border-neutral-800 flex flex-col justify-between min-h-75 transition-colors duration-300">
            <p className="text-gray-600 dark:text-neutral-300 font-medium text-lg transition-colors duration-300">
              &quot;A análise de desempenho em tempo real mudou meu jogo. Parei
              de perder tempo e passei a focar onde realmente importava.&quot;
            </p>
            <p className="font-bold text-gray-900 dark:text-neutral-100 transition-colors duration-300">
              Carlos Lima •{" "}
              <span className="font-normal text-gray-500 dark:text-neutral-500">
                Aprovado na PF
              </span>
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-neutral-900 p-8 rounded-[40px] border border-gray-100 dark:border-neutral-800 flex flex-col justify-between min-h-75 transition-colors duration-300">
            <p className="text-gray-600 dark:text-neutral-300 font-medium text-lg transition-colors duration-300">
              &quot;O ecossistema perfeito para quem estuda e trabalha. O
              cronograma inteligente foi o meu maior aliado até a
              nomeação.&quot;
            </p>
            <p className="font-bold text-gray-900 dark:text-neutral-100 transition-colors duration-300">
              Mariana R. •{" "}
              <span className="font-normal text-gray-500 dark:text-neutral-500">
                Auditora da Receita
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Botão Admin Oculto */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link href="/admin">
          <button className="w-14 h-14 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 shadow-xl rounded-full flex items-center justify-center text-gray-700 dark:text-neutral-400 transition-all hover:scale-110">
            <LayoutDashboard size={20} />
          </button>
        </Link>
      </div>
    </div>
  );
}
