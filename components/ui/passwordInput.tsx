"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import {
  getPasswordScore,
  getPasswordStrength,
  passwordStrengthCopy,
} from "@/lib/validation";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showStrength?: boolean;
}

/**
 * Password field with a show/hide toggle. When `showStrength` is set,
 * renders a small four-segment strength meter driven by the current value.
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    { label, error, showStrength = false, id, value, className = "", ...props },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? props.name;
    const stringValue = typeof value === "string" ? value : "";
    const score = getPasswordScore(stringValue);
    const strength = getPasswordStrength(stringValue);

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-[#111827]"
        >
          {label}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]">
            <Lock size={18} strokeWidth={1.75} />
          </span>
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            value={value}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={`w-full rounded-xl border bg-white py-3 pl-11 pr-11 text-[15px] text-[#111827] placeholder:text-[#9CA3AF] transition-all duration-200 focus:outline-none focus:ring-4 ${
              error
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-[#E5E7EB] focus:border-[#10B981] focus:ring-[#10B981]/15"
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-[#6B7280] transition-colors hover:text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#10B981]/40"
          >
            {visible ? (
              <EyeOff size={18} strokeWidth={1.75} />
            ) : (
              <Eye size={18} strokeWidth={1.75} />
            )}
          </button>
        </div>

        {showStrength && stringValue.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((segment) => (
                <div
                  key={segment}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    segment < score
                      ? passwordStrengthCopy[strength].barColor
                      : "bg-[#E5E7EB]"
                  }`}
                />
              ))}
            </div>
            <p
              className={`mt-1 text-xs font-medium ${passwordStrengthCopy[strength].textColor}`}
            >
              {passwordStrengthCopy[strength].label} password
            </p>
          </div>
        )}

        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="mt-1.5 text-xs font-medium text-red-500"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;