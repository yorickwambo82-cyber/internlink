"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useAnimationFrame,
  wrap,
  useMotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export function ScrollVelocityContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden py-10",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ScrollVelocityRow({
  children,
  baseVelocity = 5,
  direction = 1,
  className,
}: {
  children: React.ReactNode;
  baseVelocity?: number;
  direction?: number;
  className?: string;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  useAnimationFrame((t, delta) => {
    let moveBy = direction * baseVelocity * (delta / 1000);

    // If scroll velocity is high, accelerate the movement
    moveBy += moveBy * velocityFactor.get();
    
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className={cn("flex w-full overflow-hidden whitespace-nowrap", className)}>
      <motion.div className="flex flex-nowrap whitespace-nowrap" style={{ x }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="block pr-8 uppercase">
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
