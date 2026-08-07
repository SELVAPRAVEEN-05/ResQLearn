"use client";

import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";

interface LoaderProps {
  children: React.ReactNode;
}

const COLORS = {
  primary: "#10B981",
  white: "#FFFFFF",
  lightGray: "#F9FAFB",
  gray: "#F3F4F6",
  borderGray: "#E5E7EB",
  darkGray: "#6B7280",
  text: "#111827",
  textSecondary: "#6B7280",
};

// Split text into characters for stagger animation
const SplitText = ({ text }: { text: string }) => (
  <span className="inline-flex overflow-hidden flex-wrap justify-center">
    {text.split("").map((char, i) => (
      <motion.span
        key={i}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: i * 0.04, duration: 0.5 }}
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
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden px-6"
            style={{ backgroundColor: COLORS.white }}
          >
            {/* Ambient glow field */}
            <div className="absolute inset-0">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] rounded-full blur-3xl -top-24 -left-24 sm:-top-40 sm:-left-40"
                style={{ backgroundColor: COLORS.primary }}
              />
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.16, 0.08] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute w-[240px] h-[240px] sm:w-[420px] sm:h-[420px] rounded-full blur-3xl bottom-0 right-0"
                style={{ backgroundColor: COLORS.primary }}
              />
            </div>

            {/* Horizon line */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div
                className="w-full h-px"
                style={{
                  background: `linear-gradient(to right, transparent, ${COLORS.primary}, transparent)`,
                }}
              />
            </div>

            {/* Main Content */}
            <div className="relative flex flex-col items-center gap-6 sm:gap-10 w-full max-w-xs sm:max-w-sm">
              {/* Mark: drawn-on check-shield */}
              <motion.svg
                width="72"
                height="72"
                viewBox="0 0 100 100"
                fill="none"
                className="w-16 h-16 sm:w-24 sm:h-24"
              >
                <motion.path
                  d="M50 8 L86 22 V50 C86 72 70 86 50 94 C30 86 14 72 14 50 V22 Z"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  stroke={COLORS.primary}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                />
                <motion.path
                  d="M34 52 L45 63 L67 39"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  stroke={COLORS.primary}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                />
              </motion.svg>

              {/* Pulse rings */}
              <div className="relative w-24 h-24 sm:w-36 sm:h-36 flex items-center justify-center -mt-2 -mb-2">
                <motion.div
                  animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  className="absolute w-10 h-10 sm:w-16 sm:h-16 rounded-full border"
                  style={{ borderColor: COLORS.primary }}
                />
                <motion.div
                  animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 1 }}
                  className="absolute w-10 h-10 sm:w-16 sm:h-16 rounded-full border"
                  style={{ borderColor: COLORS.primary }}
                />
                <div
                  className="absolute w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS.primary }}
                />
              </div>

              {/* Headline + status line */}
              <div className="text-center space-y-2 sm:space-y-4 px-2">
                <h1
                  className="text-xl sm:text-3xl font-semibold tracking-tight leading-snug"
                  style={{ color: COLORS.text }}
                >
                  <SplitText text="Getting things ready" />
                </h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xs sm:text-sm tracking-widest uppercase"
                  style={{ color: COLORS.textSecondary }}
                >
                  Just a moment
                </motion.p>
              </div>

              {/* Progress bar */}
              <div
                className="w-full max-w-[220px] sm:w-72 h-[3px] overflow-hidden relative rounded-full"
                style={{ backgroundColor: COLORS.borderGray }}
              >
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-0 left-0 h-full w-1/2 rounded-full"
                  style={{ backgroundColor: COLORS.primary }}
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