"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface AnimatedHeroProps {
  commandNames: string[];
}

export function AnimatedHero({ commandNames }: AnimatedHeroProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % commandNames.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [commandNames.length]);

  return (
    <h1 className="font-mono font-normal text-4xl text-neutral-800 tracking-tight md:text-5xl">
      <span>/arc</span>
      <span className="text-[var(--color-accent)]">:</span>
      <span className="relative inline-block min-w-[180px] md:min-w-[240px]">
        <AnimatePresence mode="wait">
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-[var(--color-accent)]"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            key={commandNames[index]}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {commandNames[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </h1>
  );
}
