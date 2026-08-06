"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Shared button used for form submission and social auth actions.
 * `loading` disables the button and swaps the content for a spinner
 * so users get feedback while the (dummy) submit handler "runs".
 */
export default function Button({
  variant = "primary",
  loading = false,
  icon,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3 text-[15px] font-semibold transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70";

  const variants = {
    primary:
      "bg-[#10B981] text-white shadow-sm shadow-emerald-900/10 hover:bg-[#0EA271] active:bg-[#0D9268] focus:ring-[#10B981]/25",
    secondary:
      "border border-[#E5E7EB] bg-white text-[#111827] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] focus:ring-[#10B981]/15",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Please wait…</span>
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}