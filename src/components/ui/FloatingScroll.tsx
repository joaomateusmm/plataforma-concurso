"use client";

import React, { useEffect, useRef, useState } from "react";

export interface FloatingScrollbarProps {
  hideTimeout?: number;
  pillColor?: string;
  pillWidth?: number;
  pillHeight?: number;
  rightMargin?: number;
  useMixBlendDifference?: boolean;
}

export default function FloatingScrollbar({
  hideTimeout = 1000,
  pillColor = "#a3a3a3",
  pillWidth = 6,
  pillHeight = 100,
  rightMargin = 4,
  useMixBlendDifference = true,
}: FloatingScrollbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isGlobal, setIsGlobal] = useState(true);

  const [localHeightData, setLocalHeightData] = useState({
    scrollHeight: 0,
    clientHeight: 0,
  });

  const scrollbarRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef(hideTimeout);

  useEffect(() => {
    timeoutRef.current = hideTimeout;
  }, [hideTimeout]);

  useEffect(() => {
    const wrapper = scrollbarRef.current;
    const pill = pillRef.current;
    const parent = wrapper?.parentElement;

    if (!wrapper || !pill || !parent) return;

    const isGlobalScroll =
      parent.tagName === "BODY" || parent.tagName === "HTML";

    const target = isGlobalScroll ? window : parent;
    let timeoutId: NodeJS.Timeout;
    let ticking = false;

    const updateScroll = () => {
      // 1. Correção: Atualizar o estado de forma assíncrona (dentro do frame de animação)
      setIsGlobal(isGlobalScroll);

      const currentScroll = isGlobalScroll ? window.scrollY : parent.scrollTop;
      const scrollHeight = isGlobalScroll
        ? document.documentElement.scrollHeight
        : parent.scrollHeight;
      const clientHeight = isGlobalScroll
        ? window.innerHeight
        : parent.clientHeight;

      const totalHeight = scrollHeight - clientHeight;

      if (!isGlobalScroll) {
        setLocalHeightData((prev) => {
          if (
            prev.scrollHeight !== scrollHeight ||
            prev.clientHeight !== clientHeight
          ) {
            return { scrollHeight, clientHeight };
          }
          return prev;
        });
      }

      if (totalHeight <= 0) {
        pill.style.transform = `translateY(0%)`;
        pill.style.top = `0%`;
        ticking = false;
        return;
      }

      const percentage = Math.min(
        100,
        Math.max(0, (currentScroll / totalHeight) * 100),
      );

      pill.style.top = `${percentage}%`;
      pill.style.transform = `translateY(-${percentage}%)`;
      setIsVisible(true);

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsVisible(false), timeoutRef.current);

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    // Chamamos a primeira atualização envelopada num requestAnimationFrame
    // Isso evita o erro de setar estado sincronicamente no hook
    window.requestAnimationFrame(updateScroll);

    target.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      target.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      ref={scrollbarRef}
      // 2. Correção: Trocamos o z-[9999] por z-9999 conforme sugerido pelo Tailwind
      className={`pointer-events-none z-9999 flex justify-center ${
        useMixBlendDifference ? "mix-blend-difference" : ""
      } ${isGlobal ? "fixed bottom-0 top-0 items-center" : "absolute top-0"}`}
      style={{
        right: `${rightMargin}px`,
        width: `${Math.max(12, pillWidth)}px`,
        ...(!isGlobal && localHeightData.scrollHeight > 0
          ? { height: `${localHeightData.scrollHeight}px` }
          : {}),
      }}
    >
      <div
        className={`w-full ${
          isGlobal ? "relative" : "sticky top-0 flex flex-col justify-center"
        }`}
        style={
          !isGlobal && localHeightData.clientHeight > 0
            ? { height: `${localHeightData.clientHeight}px` }
            : { height: isGlobal ? "98vh" : "100%" }
        }
      >
        <div className={`relative w-full ${isGlobal ? "h-full" : "h-[98%]"}`}>
          <div
            ref={pillRef}
            className={`absolute right-0 rounded-full backdrop-blur-md transition-opacity duration-300 ${
              isVisible ? "opacity-100" : "opacity-0 hover:opacity-100"
            }`}
            style={{
              width: `${pillWidth}px`,
              height: `${pillHeight}px`,
              backgroundColor: pillColor,
              top: "0%",
              transform: "translateY(0%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
