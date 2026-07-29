"use client";

import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";

interface LoaderProps {
  children: React.ReactNode;
}

// Split text into characters for stagger animation
const SplitText = ({ text }: { text: string }) => (
  <span className="inline-flex overflow-hidden">
    {text.split("").map((char, i) => (
      <motion.span
        key={i}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: i * 0.05, duration: 0.5 }}
        className="inline-block"
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ))}
  </span>
);

export default function Loader({ children }: LoaderProps) {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-black overflow-hidden"
          >
            {/* Grain Overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Animated Gradient Background */}
            {/* <div className="absolute inset-0">
              <motion.div
                animate={{ scale: [1, 1.3, 1], rotate: [0, 360] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute w-[700px] h-[700px] bg-purple-500/30 rounded-full blur-3xl -top-60 -left-60"
              />

              <motion.div
                animate={{ scale: [1, 1.4, 1], rotate: [360, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                className="absolute w-[600px] h-[600px] bg-cyan-400/30 rounded-full blur-3xl bottom-0 right-0"
              />
            </div> */}

            {/* Floating Lines (classic aesthetic) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white to-transparent" />
            </div>

            {/* Main Content */}
            <div className="relative flex flex-col items-center gap-12">
              {/* SVG Logo Draw Animation */}
              <motion.svg
                width="120"
                height="120"
                viewBox="0 0 100 100"
                fill="none"
                className="stroke-current text-black dark:text-white"
              >
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                <motion.text
                  x="50%"
                  y="55%"
                  textAnchor="middle"
                  className="text-xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  SP
                </motion.text>
              </motion.svg>

              {/* Rotating Rings */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-white/20"
                />

                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 10,
                    ease: "linear",
                  }}
                  className="absolute inset-6 rounded-full border border-white/10"
                />
              </div>

              {/* Animated Text (Premium) */}
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white">
                  <SplitText text="Crafting Digital Experience" />
                </h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-sm text-gray-500 dark:text-gray-400"
                >
                  Design • Code • Motion
                </motion.p>
              </div>

              {/* Elegant Progress Bar */}
              <div className="w-72 h-[2px] bg-gray-200 dark:bg-gray-800 overflow-hidden relative">
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white to-transparent dark:via-white"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: isLoading ? 0 : 1, scale: isLoading ? 0.96 : 1 }}
        transition={{ duration: 0.8 }}
      >
        {children}
      </motion.div>
    </>
  );
}
