"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
  hint?: string;
}

/**
 * Shared text input used across the login and register forms.
 * Handles label association, icon slot, error and hint messaging,
 * and consistent focus / error styling.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, hint, id, className = "", ...props }, ref) => {
    const inputId = id ?? props.name;
    const describedBy = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined;

    return (
      <div className="w-full">
        <label
          className="mb-1.5 block text-sm font-medium text-[#111827]"
          htmlFor={inputId}
        >
          {label}
        </label>
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            aria-describedby={describedBy}
            aria-invalid={Boolean(error)}
            className={`w-full rounded-xl border bg-white py-3 text-[15px] text-[#111827] placeholder:text-[#9CA3AF] transition-all duration-200 focus:outline-none focus:ring-4 ${
              icon ? "pl-11 pr-4" : "px-4"
            } ${
              error
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-[#E5E7EB] focus:border-[#10B981] focus:ring-[#10B981]/15"
            } ${className}`}
            id={inputId}
            {...props}
          />
        </div>
        {error ? (
          <p
            className="mt-1.5 text-xs font-medium text-red-500"
            id={`${inputId}-error`}
            role="alert"
          >
            {error}
          </p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-[#6B7280]" id={`${inputId}-hint`}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
