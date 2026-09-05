"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedNumber({
  value,
  duration = 1200,
}: {
  value: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const effectiveDuration = prefersReducedMotion ? 0 : duration;
    const start = performance.now();

    function tick(now: number) {
      const progress =
        effectiveDuration === 0
          ? 1
          : Math.min((now - start) / effectiveDuration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}
