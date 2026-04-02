"use client";

import Image from "next/image"; // <-- Importando o Image do Next.js
import React from "react";

export interface GalleryItem {
  image: string;
  text: string;
}

interface VerticalCarouselProps {
  items: GalleryItem[];
  speed?: number;
  col1Direction?: "up" | "down";
  col2Direction?: "up" | "down";
  pauseOnHover?: boolean;
}

export function VerticalCarousel({
  items,
  speed = 20,
  col1Direction = "up",
  col2Direction = "down",
  pauseOnHover = true,
}: VerticalCarouselProps) {
  // Duplicamos o array para criar a ilusão de um loop infinito
  const duplicatedItems = [...items, ...items];

  return (
    <div
      className="relative flex h-full w-full gap-4 overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 35%, black 90%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 35%, black 90%, transparent 100%)",
      }}
    >
      <style>{`
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scroll-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-scroll-up {
          animation: scroll-up linear infinite;
        }
        .animate-scroll-down {
          animation: scroll-down linear infinite;
        }
        .pause-on-hover:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* COLUNA 1 */}
      <div className="relative w-1/2 overflow-hidden">
        <div
          className={`flex flex-col gap-4 ${
            col1Direction === "up" ? "animate-scroll-up" : "animate-scroll-down"
          } ${pauseOnHover ? "pause-on-hover" : ""}`}
          style={{ animationDuration: `${speed}s` }}
        >
          {duplicatedItems.map((item, idx) => (
            <div
              key={`col1-${idx}`}
              className="group relative h-80 w-full shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-neutral-900"
            >
              {/* NEXT IMAGE AQUI */}
              <Image
                src={item.image}
                alt={item.text}
                fill // Faz a imagem preencher a div pai (h-64 w-full)
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized={item.image.includes("picsum.photos")} // Desativa otimização para picsum pra evitar erros de hostname
              />
              <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/80 via-black/20 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-lg font-bold tracking-wide text-white">
                  {item.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COLUNA 2 */}
      <div className="relative w-1/2 overflow-hidden">
        <div
          className={`flex flex-col gap-4 ${
            col2Direction === "up" ? "animate-scroll-up" : "animate-scroll-down"
          } ${pauseOnHover ? "pause-on-hover" : ""}`}
          style={{ animationDuration: `${speed}s` }}
        >
          {duplicatedItems.map((item, idx) => (
            <div
              key={`col2-${idx}`}
              className="group relative h-80 w-full shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-neutral-900"
            >
              {/* NEXT IMAGE AQUI */}
              <Image
                src={item.image}
                alt={item.text}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized={item.image.includes("picsum.photos")}
              />
              <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/80 via-black/20 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-lg font-bold tracking-wide text-white">
                  {item.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
