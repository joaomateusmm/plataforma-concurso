"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import TiltedCard from "@/components/TiltedCard";

export default function FloatingHeroImages() {
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);

  return (
    <>
      {/* Imagem hover tool tip 1 (Direita) */}
      <div
        className="absolute right-22 top-32 hidden flex-col items-center xl:flex justify-center z-40"
        onMouseEnter={() => setHoveredImage(1)}
        onMouseLeave={() => setHoveredImage(null)}
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
              {/* O triângulo (setinha) agora adapta-se: border-b-white no claro, border-b-neutral-900 no escuro */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white/90 dark:border-b-neutral-900/90 transition-colors duration-300"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Imagem hover tool tip 2 (Esquerda) */}
      <div
        className="absolute left-22 top-82 xl:flex flex-col hidden items-center justify-center z-40"
        onMouseEnter={() => setHoveredImage(2)}
        onMouseLeave={() => setHoveredImage(null)}
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
              {/* O triângulo (setinha) para o tooltip 2 */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white/90 dark:border-b-neutral-900/90 transition-colors duration-300"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
