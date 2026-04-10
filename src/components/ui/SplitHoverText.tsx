"use client";
import { motion } from "framer-motion";

export interface SplitHoverTextProps {
  text?: string;
  children?: string;
  hoverText?: string;
  originalColor?: string;
  hoverColor?: string;
  animationDuration?: number;
  delayStep?: number;
  className?: string;
}

export const SplitHoverText = ({
  text,
  children,
  hoverText,
  originalColor,
  hoverColor = "#ffffff",
  animationDuration = 0.25,
  delayStep = 0.025,
  className = "",
}: SplitHoverTextProps) => {
  const displayText = text || children || "";
  const textToHover = hoverText || displayText;
  const letters = displayText.split("");
  const hoverLetters = textToHover.split("");

  return (
    <motion.div
      initial="initial"
      whileHover="hovered"
      className={`relative block cursor-pointer overflow-hidden leading-none whitespace-nowrap ${className}`}
      style={{ lineHeight: 1.2 }}
    >
      <div style={{ color: originalColor }}>
        {letters.map((l, i) => (
          <motion.span
            key={i}
            className="inline-block"
            variants={{
              initial: { y: 0 },
              hovered: { y: "-100%" },
            }}
            transition={{
              duration: animationDuration,
              ease: "easeInOut",
              delay: delayStep * i,
            }}
          >
            {l === " " ? "\u00A0" : l}
          </motion.span>
        ))}
      </div>

      <div className="absolute inset-0" style={{ color: hoverColor }}>
        {hoverLetters.map((l, i) => (
          <motion.span
            key={i}
            className="inline-block"
            variants={{
              initial: { y: "100%" },
              hovered: { y: 0 },
            }}
            transition={{
              duration: animationDuration,
              ease: "easeInOut",
              delay: delayStep * i,
            }}
          >
            {l === " " ? "\u00A0" : l}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};
