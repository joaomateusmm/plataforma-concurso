"use client";

import { motion, useAnimation, useInView } from "framer-motion";
import React, { useEffect, useRef } from "react";

export interface RevealBlockTextProps {
  children?: React.ReactNode;
  text?: string;
  width?: "fit-content" | "100%";
  boxColor?: string;
  delay?: number;
  shouldAnimate?: boolean;
}

export const RevealBlockText = ({
  children,
  text = "Sword Tools Reveal",
  width = "fit-content",
  boxColor = "#372AAC",
  delay = 0.1,
  shouldAnimate = true,
}: RevealBlockTextProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const mainControls = useAnimation();
  const slideControls = useAnimation();

  useEffect(() => {
    if (isInView && shouldAnimate) {
      mainControls.start("visible");
      slideControls.start("visible");
    }
  }, [
    isInView,
    shouldAnimate,
    mainControls,
    slideControls,
    text,
    boxColor,
    delay,
  ]);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width,
        overflow: "hidden",
      }}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 0 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{
          duration: 0.01,
          delay: delay + 0.45,
        }}
      >
        {children ? (
          children
        ) : (
          <span className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            {text}
          </span>
        )}
      </motion.div>

      <motion.div
        variants={{
          hidden: { left: "-100%" },
          visible: { left: "100%" },
        }}
        initial="hidden"
        animate={slideControls}
        transition={{
          duration: 0.9,
          ease: "easeInOut",
          delay: delay,
        }}
        style={{
          position: "absolute",
          top: 4,
          bottom: 4,
          width: "100%",
          height: "100%",
          background: boxColor,
          zIndex: 20,
        }}
      />
    </div>
  );
};
