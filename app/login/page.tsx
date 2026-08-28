"use client";

import AuthLayout from "@/components/auth/authLayout";
import SocialButton from "@/components/auth/socialButton";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Divider from "@/components/ui/divider";
import Input from "@/components/ui/input";
import PasswordInput from "@/components/ui/passwordInput";
import Toast from "@/components/ui/toast";
import { isRequired, isValidEmail } from "@/lib/validation";
import type { LoginFormData, LoginFormErrors, ToastState } from "@/types/auth";
import { LogIn, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const FEATURES = [
  "AI-powered learning",
  "Interactive disaster knowledge",
  "Personalized education",
  "Emergency preparedness",
];

const INITIAL_FORM: LoginFormData = {
  email: "",
  password: "",
  rememberMe: false,
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  type ErrorField = keyof LoginFormErrors;

  function updateField<K extends keyof LoginFormData>(
    key: K,
    value: LoginFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));

    if (key === "email" || key === "password") {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as ErrorField];
        return next;
      });
    }
  }

  function validate(): boolean {
    const nextErrors: LoginFormErrors = {};

    if (!isRequired(form.email)) {
      nextErrors.email = "Email address or username is required.";
    } else if (form.email !== "admin" && !isValidEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!isRequired(form.password)) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToast({
        type: "success",
        message: "Signed in successfully. Welcome back!",
      });
      if (form.email === "admin" && form.password === "admin123") {
        document.cookie = "role=admin; path=/";
        router.push("/admin");
      } else {
        document.cookie = "role=student; path=/";
        router.push("/user/dashboard");
      }
    }, 1200);
  }

  return (
    <AuthLayout
      heading="Welcome to SafeGraph AI"
      description="Empowering disaster preparedness education through Knowledge Graphs, Agentic AI and Explainable AI."
      features={FEATURES}
      illustrationVariant="shield"
    >
      <div className="animate-[fadeIn_0.5s_ease-out] rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-[0_4px_24px_-4px_rgba(17,24,39,0.06)] sm:p-9">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B981]/10 text-[#10B981]">
            <Sparkles size={24} strokeWidth={2} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#111827]">
            SafeGraph AI
          </h2>
          <p className="mt-1.5 text-sm text-[#6B7280]">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Input
            label="Email or Username"
            type="text"
            name="email"
            autoComplete="email"
            placeholder="you@university.edu or admin"
            icon={<Mail size={18} strokeWidth={1.75} />}
            value={form.email}
            error={errors.email}
            onChange={(e) => updateField("email", e.target.value)}
          />

          <PasswordInput
            label="Password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={form.password}
            error={errors.password}
            onChange={(e) => updateField("password", e.target.value)}
          />

          <div className="flex items-center justify-between">
            <Checkbox
              label="Remember me"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={(e) =>
                setForm({ ...form, rememberMe: e.target.checked })
              }
            />
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#10B981] transition-colors hover:text-[#0D9268] focus:outline-none focus-visible:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading} icon={<LogIn size={18} />}>
            Log In
          </Button>

          <Divider label="or" />

          <SocialButton
            onClick={() =>
              setToast({
                type: "success",
                message: "Google sign-in is a placeholder in this demo.",
              })
            }
          />
        </form>

        <p className="mt-7 text-center text-sm text-[#6B7280]">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#10B981] transition-colors hover:text-[#0D9268] focus:outline-none focus-visible:underline"
          >
            Register now
          </Link>
        </p>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </AuthLayout>
  );
}
