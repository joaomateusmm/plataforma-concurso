"use client";

import type { SpringOptions } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { gsap } from "gsap";

interface TiltedCardProps {
  // === Props do TiltedCard Original ===
  imageSrc: React.ComponentProps<"img">["src"];
  altText?: string;
  captionText?: string;
  containerHeight?: React.CSSProperties["height"];
  containerWidth?: React.CSSProperties["width"];
  imageHeight?: React.CSSProperties["height"];
  imageWidth?: React.CSSProperties["width"];
  scaleOnHover?: number;
  rotateAmplitude?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  overlayContent?: React.ReactNode;
  displayOverlayContent?: boolean;

  // === NOVO: Props do PixelTransition ===
  secondImageSrc?: React.ComponentProps<"img">["src"]; // Imagem que aparece no Hover
  gridSize?: number;
  pixelColor?: string;
  animationStepDuration?: number;
}

const springValues: SpringOptions = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

export default function TiltedCard({
  imageSrc,
  altText = "Tilted card image",
  captionText = "",
  containerHeight = "300px",
  containerWidth = "100%",
  imageHeight = "300px",
  imageWidth = "300px",
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showMobileWarning = true,
  showTooltip = false,
  overlayContent = null,
  displayOverlayContent = false,
  secondImageSrc,
  gridSize = 16,
  pixelColor = "#10B981",
  animationStepDuration = 0.6,
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1,
  });

  const [lastY, setLastY] = useState(0);

  // ==========================================
  // ESTADOS & REFS: PIXEL TRANSITION (GSAP)
  // ==========================================
  const pixelGridRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLDivElement | null>(null);
  const delayedCallRef = useRef<gsap.core.Tween | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);

  const isTouchDevice =
    typeof window !== "undefined" &&
    ("ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches);

  // 1. Constrói o grid de pixels ao renderizar
  useEffect(() => {
    if (!secondImageSrc) return; // Se não houver 2ª imagem, não constrói o grid

    const pixelGridEl = pixelGridRef.current;
    if (!pixelGridEl) return;

    pixelGridEl.innerHTML = "";

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const pixel = document.createElement("div");
        pixel.classList.add("pixelated-image-card__pixel");
        pixel.classList.add("absolute", "hidden");
        pixel.style.backgroundColor = pixelColor;

        const size = 100 / gridSize;
        pixel.style.width = `${size}%`;
        pixel.style.height = `${size}%`;
        pixel.style.left = `${col * size}%`;
        pixel.style.top = `${row * size}%`;

        pixelGridEl.appendChild(pixel);
      }
    }
  }, [gridSize, pixelColor, secondImageSrc]);

  // 2. Animação de Pixels usando GSAP
  const animatePixels = (activate: boolean): void => {
    setIsActive(activate);

    const pixelGridEl = pixelGridRef.current;
    const activeEl = activeRef.current;
    if (!pixelGridEl || !activeEl) return;

    const pixels = pixelGridEl.querySelectorAll<HTMLDivElement>(
      ".pixelated-image-card__pixel",
    );
    if (!pixels.length) return;

    gsap.killTweensOf(pixels);
    if (delayedCallRef.current) {
      delayedCallRef.current.kill();
    }

    gsap.set(pixels, { display: "none" });

    const totalPixels = pixels.length;
    const staggerDuration = animationStepDuration / totalPixels;

    // Fase 1: Pixels aparecem
    gsap.to(pixels, {
      display: "block",
      duration: 0,
      stagger: {
        each: staggerDuration,
        from: "random",
      },
    });

    // Fase 2: Troca a imagem por trás dos pixels
    delayedCallRef.current = gsap.delayedCall(animationStepDuration, () => {
      activeEl.style.display = activate ? "block" : "none";
      activeEl.style.pointerEvents = activate ? "none" : "";
    });

    // Fase 3: Pixels somem revelando a nova imagem
    gsap.to(pixels, {
      display: "none",
      duration: 0,
      delay: animationStepDuration,
      stagger: {
        each: staggerDuration,
        from: "random",
      },
    });
  };

  // ==========================================
  // EVENT HANDLERS (Combinando Motion + GSAP)
  // ==========================================
  function handleMouse(e: React.MouseEvent<HTMLElement>) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);

    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    if (!isTouchDevice) {
      scale.set(scaleOnHover);
      opacity.set(1);
      // Inicia a transição de pixels se houver segunda imagem
      if (secondImageSrc && !isActive) animatePixels(true);
    }
  }

  function handleMouseLeave() {
    if (!isTouchDevice) {
      opacity.set(0);
      scale.set(1);
      rotateX.set(0);
      rotateY.set(0);
      rotateFigcaption.set(0);
      // Reverte a transição de pixels
      if (secondImageSrc && isActive) animatePixels(false);
    }
  }

  function handleClick() {
    if (isTouchDevice && secondImageSrc) {
      if (!isActive) animatePixels(true);
      else animatePixels(false);
    }
  }

  return (
    <figure
      ref={ref}
      className="relative w-full h-full perspective-midrange flex flex-col items-center justify-center cursor-pointer"
      style={{
        height: containerHeight,
        width: containerWidth,
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {showMobileWarning && (
        <div className="absolute top-4 text-center text-sm block sm:hidden text-neutral-500 z-50">
          This effect is better on desktop.
        </div>
      )}

      <motion.div
        className="relative transform-3d rounded-[15px] overflow-hidden"
        style={{
          width: imageWidth,
          height: imageHeight,
          rotateX,
          rotateY,
          scale,
        }}
      >
        {/* Camada 1: Imagem Base */}
        <motion.img
          src={imageSrc}
          alt={altText}
          className="absolute top-0 left-0 object-cover w-full h-full will-change-transform transform-[translateZ(0)]"
        />

        {/* Camada 2: Segunda Imagem (Aparece no Hover via GSAP) */}
        {secondImageSrc && (
          <div
            ref={activeRef}
            className="absolute inset-0 w-full h-full z-2 transform-[translateZ(1px)]"
            style={{ display: "none" }}
            aria-hidden={!isActive}
          >
            <img
              src={secondImageSrc}
              alt={`${altText} alternativo`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Camada 3: Grid de Pixels de Transição */}
        {secondImageSrc && (
          <div
            ref={pixelGridRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-3 transform-[translateZ(2px)]"
          />
        )}

        {/* Camada 4: Overlay Content Original do TiltedCard */}
        {displayOverlayContent && overlayContent && (
          <motion.div className="absolute top-0 left-0 z-4 w-full h-full will-change-transform transform-[translateZ(30px)] pointer-events-none">
            {overlayContent}
          </motion.div>
        )}
      </motion.div>

      {showTooltip && (
        <motion.figcaption
          className="pointer-events-none absolute left-0 top-0 rounded-sm bg-white px-2.5 py-1 text-[10px] text-[#2d2d2d] opacity-0 z-10 hidden sm:block shadow-lg"
          style={{
            x,
            y,
            opacity,
            rotate: rotateFigcaption,
          }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
}
