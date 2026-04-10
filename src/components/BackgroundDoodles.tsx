"use client";

import { motion, Variants } from "framer-motion";

export default function BackgroundDoodles() {
  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 0.35,
      transition: {
        pathLength: { delay: 2.2, type: "spring", duration: 5, bounce: 0 },
        opacity: { delay: 2.2, duration: 0.01 },
      },
    },
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-visible">
      <motion.svg
        className="absolute top-[5%] md:top-[-2%] left-[5%] md:left-[-3%] w-16 h-16 md:w-24 md:h-24 text-[#009966] -rotate-12"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          variants={draw}
          initial="hidden"
          animate="visible"
          d="M20,20 Q60,10 80,70 M80,70 L65,65 M80,70 L85,55"
        />
      </motion.svg>

      <motion.svg
        className="absolute top-[1%] right-[5%] w-12 h-12 md:w-20 md:h-20 text-[#009966] rotate-12"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          variants={draw}
          initial="hidden"
          animate="visible"
          d="M50,10 L50,30 M50,70 L50,90 M10,50 L30,50 M70,50 L90,50 M25,25 L35,35 M75,75 L65,65 M25,75 L35,65 M75,25 L65,35"
        />
      </motion.svg>

      <motion.svg
        className="absolute top-[55%] md:top-[40%] left-[15%] md:left-[10%] w-32 h-12 text-[#009966] -rotate-15"
        viewBox="0 0 200 50"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          variants={draw}
          initial="hidden"
          animate="visible"
          d="M10,25 Q30,5 50,25 T90,25 T130,25 T170,25 T210,25"
        />
      </motion.svg>

      <motion.svg
        className="absolute top-[65%] right-[1%] w-20 h-20 text-[#009966] rotate-45"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          variants={draw}
          initial="hidden"
          animate="visible"
          d="M 50, 10 C 80, 10 90, 40 90, 60 C 90, 80 60, 90 40, 90 C 20, 90 10, 70 10, 50 C 10, 30 30, 15 55, 12"
        />
      </motion.svg>

      <motion.svg
        className="absolute top-[55%] left-[-10%] w-12 h-12 md:w-20 md:h-20 text-[#009966] rotate-12"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          variants={draw}
          initial="hidden"
          animate="visible"
          d="M50,10 L50,30 M50,70 L50,90 M10,50 L30,50 M70,50 L90,50 M25,25 L35,35 M75,75 L65,65 M25,75 L35,65 M75,25 L65,35"
        />
      </motion.svg>

      <motion.svg
        className="absolute top-[5%] md:top-[30%] right-[5%] md:right-[-15%] w-16 h-16 md:w-24 md:h-24 text-[#009966] -rotate-200"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          variants={draw}
          initial="hidden"
          animate="visible"
          d="M20,20 Q60,10 80,70 M80,70 L65,65 M80,70 L85,55"
        />
      </motion.svg>
    </div>
  );
}
