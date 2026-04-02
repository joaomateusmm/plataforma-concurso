/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ReactLenis } from "lenis/react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

interface SmoothScrollProps {
  children: React.ReactNode;
  lerp?: number;
  duration?: number;
  smoothWheel?: boolean;
  wheelMultiplier?: number;
  syncTouch?: boolean;
  touchMultiplier?: number;
  root?: boolean;
}

function SmoothScrollContent({
  children,
  lerp = 0.065,
  duration = 1.5,
  smoothWheel = true,
  wheelMultiplier = 0.8,
  syncTouch = false,
  touchMultiplier = 0.8,
  root = true,
}: SmoothScrollProps) {
  const lenisRef = useRef<any>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!root || isMobile) return;

    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;

    lenis.scrollTo(0, { immediate: true });
    setTimeout(() => lenis.resize(), 150);
  }, [pathname, searchParams, root, isMobile]);

  if (isMobile) {
    if (!root) {
      return <div className="h-full w-full overflow-y-auto">{children}</div>;
    }
    return <>{children}</>;
  }

  return (
    <ReactLenis
      ref={lenisRef}
      root={root}
      className={!root ? "h-full w-full overflow-y-auto" : ""}
      options={{
        lerp,
        duration,
        smoothWheel,
        wheelMultiplier,
        syncTouch,
        touchMultiplier,
      }}
    >
      {root && (
        <style jsx global>{`
          html.lenis,
          html.lenis body {
            height: auto !important;
            overflow: auto !important;
          }
          .lenis.lenis-smooth {
            scroll-behavior: auto !important;
          }
          .lenis.lenis-stopped {
            overflow: hidden;
          }
        `}</style>
      )}
      {children}
    </ReactLenis>
  );
}

export default function SmoothScroll(props: SmoothScrollProps) {
  return (
    <Suspense fallback={props.children}>
      <SmoothScrollContent {...props} />
    </Suspense>
  );
}