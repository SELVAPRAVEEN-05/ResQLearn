// Shared type definitions for authentication forms.
// No backend integration — these describe the shapes used by local component state only.

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export type YearOfStudy =
  | ""
  | "First Year"
  | "Second Year"
  | "Third Year"
  | "Fourth Year";

export interface RegisterFormData {
  fullName: string;
  email: string;
  institution: string;
  department: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface RegisterFormErrors {
  fullName?: string;
  email?: string;
  institution?: string;
  department?: string;
  yearOfStudy?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export interface ToastState {
  type: "success" | "error";
  message: string;
}