"use client";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
} from "framer-motion";
import { useState, useEffect, useRef } from "react";
import TiltedCard from "@/components/TiltedCard";

export default function FloatingHeroImages() {
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);

  // 1. Criamos valores de movimento (Y) independentes para as duas imagens
  const y1 = useMotionValue(0);
  const y2 = useMotionValue(0);

  // 2. Refs para guardar a instância da animação (para podermos dar pause/play)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anim1 = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anim2 = useRef<any>(null);

  // 3. Iniciar a flutuação assim que o componente carrega
  useEffect(() => {
    anim1.current = animate(y1, [0, -15, 0], {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    });

    anim2.current = animate(y2, [0, -20, 0], {
      duration: 7,
      repeat: Infinity,
      ease: "easeInOut",
    });

    // Limpeza ao desmontar o componente
    return () => {
      anim1.current?.stop();
      anim2.current?.stop();
    };
  }, [y1, y2]);

  // Função para a Imagem 1
  const handleMouseEnter1 = () => {
    setHoveredImage(1);
    anim1.current?.pause(); // Congela exatamente no pixel atual!
  };
  const handleMouseLeave1 = () => {
    setHoveredImage(null);
    anim1.current?.play(); // Continua exatamente de onde parou!
  };

  // Função para a Imagem 2
  const handleMouseEnter2 = () => {
    setHoveredImage(2);
    anim2.current?.pause();
  };
  const handleMouseLeave2 = () => {
    setHoveredImage(null);
    anim2.current?.play();
  };

  return (
    <>
      {/* Imagem hover tool tip 1 (Direita) */}
      <motion.div
        style={{ y: y1 }} // Injetamos o MotionValue diretamente no estilo
        className="absolute right-22 top-32 hidden flex-col items-center xl:flex justify-center z-40"
        onMouseEnter={handleMouseEnter1}
        onMouseLeave={handleMouseLeave1}
      >
        <div className="transform rotate-3 rounded-2xl shadow-lg dark:drop-shadow-neutral-950 transition-all duration-300">
          <TiltedCard
            imageSrc="/estudantes/img5.webp"
            secondImageSrc="/estudantes/img6.webp"
            containerHeight="270px"
            containerWidth="270px"
            imageHeight="270px"
            imageWidth="270px"
            rotateAmplitude={12}
            scaleOnHover={1.05}
            showMobileWarning={false}
          />
        </div>
        <AnimatePresence>
          {hoveredImage === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute -bottom-24 w-64 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 drop-shadow-md rounded-xl p-3 text-center pointer-events-none transition-colors duration-300"
            >
              <p className="text-sm text-gray-700 dark:text-neutral-300 font-medium leading-relaxed transition-colors duration-300">
                Foco, estratégia e a{" "}
                <span className="text-[#10B981] font-bold">direção certa</span>{" "}
                para a posse.
              </p>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white/90 dark:border-b-neutral-900/90 transition-colors duration-300"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Imagem hover tool tip 2 (Esquerda) */}
      <motion.div
        style={{ y: y2 }} // Injetamos o MotionValue diretamente no estilo
        className="absolute left-22 top-82 xl:flex flex-col hidden items-center justify-center z-40"
        onMouseEnter={handleMouseEnter2}
        onMouseLeave={handleMouseLeave2}
      >
        <div className="transform -rotate-3 rounded-2xl shadow-lg dark:drop-shadow-neutral-950 transition-all duration-300">
          <TiltedCard
            imageSrc="/estudantes/img7.webp"
            secondImageSrc="/estudantes/img8.webp"
            containerHeight="270px"
            containerWidth="270px"
            imageHeight="270px"
            imageWidth="270px"
            rotateAmplitude={12}
            scaleOnHover={1.05}
            showMobileWarning={false}
          />
        </div>
        <AnimatePresence>
          {hoveredImage === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute -bottom-24 w-74 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 drop-shadow-md rounded-xl p-3 text-center pointer-events-none transition-colors duration-300"
            >
              <p className="text-sm text-gray-700 dark:text-neutral-300 font-medium leading-relaxed transition-colors duration-300">
                A <span className="text-emerald-500 font-bold">constância</span>{" "}
                que transforma editais em aprovações.
              </p>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white/90 dark:border-b-neutral-900/90 transition-colors duration-300"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
