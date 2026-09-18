"use client";

import type { LoginFormData, LoginFormErrors, ToastState } from "@/types/auth";

import { LogIn, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import AuthLayout from "@/components/auth/authLayout";
import SocialButton from "@/components/auth/socialButton";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Divider from "@/components/ui/divider";
import Input from "@/components/ui/input";
import PasswordInput from "@/components/ui/passwordInput";
import Toast from "@/components/ui/toast";
import { isRequired, isValidEmail } from "@/lib/validation";

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();

      setLoading(false);

      if (!res.ok) {
        setToast({
          type: "error",
          message: data.error || "Login failed. Please check your credentials.",
        });

        return;
      }

      if (typeof window !== "undefined") {
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      }

      setToast({
        type: "success",
        message: "Signed in successfully. Welcome back!",
      });

      if (data.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/user/dashboard");
      }
    } catch (err) {
      setLoading(false);
      setToast({
        type: "error",
        message: "Network error occurred while signing in.",
      });
    }
  }

  return (
    <AuthLayout
      description="Empowering disaster preparedness education through Knowledge Graphs, Agentic AI and Explainable AI."
      features={FEATURES}
      heading="Welcome to SafeGraph AI"
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

        <form noValidate className="space-y-5" onSubmit={handleSubmit}>
          <Input
            autoComplete="email"
            error={errors.email}
            icon={<Mail size={18} strokeWidth={1.75} />}
            label="Email or Username"
            name="email"
            placeholder="you@university.edu or admin"
            type="text"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
          />

          <PasswordInput
            autoComplete="current-password"
            error={errors.password}
            label="Password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
          />

          <div className="flex items-center justify-between">
            <Checkbox
              checked={form.rememberMe}
              label="Remember me"
              name="rememberMe"
              onChange={(e) =>
                setForm({ ...form, rememberMe: e.target.checked })
              }
            />
            <Link
              className="text-sm font-medium text-[#10B981] transition-colors hover:text-[#0D9268] focus:outline-none focus-visible:underline"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>

          <Button icon={<LogIn size={18} />} loading={loading} type="submit">
            Log In
          </Button>

          <Divider label="or" />

          <SocialButton
            onClick={() =>
              setToast({
                type: "info" as any,
                message:
                  "Please sign in with your registered institutional email or admin credentials.",
              })
            }
          />
        </form>

        <p className="mt-7 text-center text-sm text-[#6B7280]">
          Don&apos;t have an account?{" "}
          <Link
            className="font-semibold text-[#10B981] transition-colors hover:text-[#0D9268] focus:outline-none focus-visible:underline"
            href="/register"
          >
            Register now
          </Link>
        </p>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </AuthLayout>
  );
}
