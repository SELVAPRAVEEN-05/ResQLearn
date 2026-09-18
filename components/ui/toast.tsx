"use client";

import type { ToastState } from "@/types/auth";

import { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

interface ToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
}

/**
 * Fixed-position toast used to show placeholder success/error feedback
 * after a dummy form submission. Auto-dismisses after a few seconds.
 */
export default function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 4000);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-[fadeInUp_0.3s_ease-out] items-start gap-3 rounded-xl border bg-white p-4 shadow-lg shadow-black/5"
      role="status"
      style={{
        borderColor: isSuccess ? "#A7F3D0" : "#FECACA",
      }}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 shrink-0 text-[#10B981]" size={20} />
      ) : (
        <XCircle className="mt-0.5 shrink-0 text-red-500" size={20} />
      )}
      <p className="flex-1 text-sm text-[#111827]">{toast.message}</p>
      <button
        aria-label="Dismiss notification"
        className="shrink-0 text-[#9CA3AF] transition-colors hover:text-[#111827]"
        onClick={onDismiss}
      >
        <X size={16} />
      </button>
    </div>
  );
}
