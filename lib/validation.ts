// Lightweight, dependency-free validation helpers shared by the login and
// register forms. These run entirely client-side against local state —
// there is no backend call involved.

import type { PasswordStrength } from "@/types/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Scores a password from 0-4 based on length and character variety.
 * This is a UX signal only, not a security guarantee.
 */
export function getPasswordScore(password: string): number {
  if (!password) return 0;

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return Math.min(score, 4);
}

export function getPasswordStrength(password: string): PasswordStrength {
  const score = getPasswordScore(password);
  if (score <= 1) return "weak";
  if (score === 2) return "fair";
  if (score === 3) return "good";
  return "strong";
}

export const passwordStrengthCopy: Record<
  PasswordStrength,
  { label: string; barColor: string; textColor: string }
> = {
  weak: { label: "Weak", barColor: "bg-red-400", textColor: "text-red-500" },
  fair: {
    label: "Fair",
    barColor: "bg-amber-400",
    textColor: "text-amber-600",
  },
  good: {
    label: "Good",
    barColor: "bg-emerald-400",
    textColor: "text-emerald-600",
  },
  strong: {
    label: "Strong",
    barColor: "bg-emerald-500",
    textColor: "text-emerald-600",
  },
};

export function isStrongEnoughPassword(password: string): boolean {
  return password.length >= 8;
}