"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export interface RouterButtonProps {
  isVisible?: boolean;
  text?: string;
  loadingText?: string;
  href?: string;
  backgroundColor?: string;
  textColor?: string;
  glowColorRGBA?: string;
  hoverGlowSpread?: string;
  borderRadius?: string | number;
  width?: number;
  loadingWidth?: number;
  redirectDelay?: number;
  entranceDelay?: number;
  routerClick?: boolean;
}

export function RouterButton({
  isVisible = true,
  text = "Get Started",
  loadingText = "Loading...",
  href = "/get-started",
  backgroundColor = "rgba(0, 0, 0, 0.9)",
  textColor = "#ffffff",
  glowColorRGBA = "rgba(255, 255, 255, 0.2)",
  hoverGlowSpread = "8px",
  borderRadius = "8px",
  width = 140,
  loadingWidth = 120,
  redirectDelay = 0,
  entranceDelay = 0.8,
  routerClick = true,
}: RouterButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleStart = () => {
    setIsLoading(true);

    if (!routerClick) {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } else {
      setTimeout(() => {
        window.location.href = href;
      }, redirectDelay);
    }
  };

  return (
    <motion.button
      onClick={handleStart}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      disabled={isLoading || !isVisible}
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 20,
        width: isLoading ? loadingWidth : width,
        scale: isLoading ? 0.95 : 1,
        boxShadow:
          isHovered && !isLoading
            ? `0px 0px ${hoverGlowSpread} 0px ${glowColorRGBA}`
            : `0px 0px 0px 0px ${glowColorRGBA}`,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: isVisible && !isLoading ? entranceDelay : 0,
        boxShadow: {
          type: "tween",
          ease: "easeInOut",
          duration: 0.3,
        },
      }}
      className="relative flex h-14 cursor-pointer flex-col items-center justify-center outline-none disabled:cursor-not-allowed"
      style={{
        backgroundColor: backgroundColor,
        borderRadius: borderRadius,
        padding: 0,
      }}
    >
      <div className="relative z-20 flex w-full items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.p
              key="loading"
              initial={{ opacity: 0, y: -25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 17 }}
              className="font-sans text-[16px] font-medium tracking-wide"
              style={{ color: textColor }}
            >
              {loadingText}
            </motion.p>
          ) : (
            <motion.p
              key="text"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 17 }}
              className="font-sans text-[17px] font-medium tracking-wide"
              style={{
                color: textColor,
              }}
            >
              {text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
