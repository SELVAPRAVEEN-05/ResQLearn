"use client";

import type {
  RegisterFormData,
  RegisterFormErrors,
  ToastState,
} from "@/types/auth";

import { BookOpen, Building2, Mail, User, UserPlus } from "lucide-react";
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
import {
  isRequired,
  isStrongEnoughPassword,
  isValidEmail,
} from "@/lib/validation";

const FEATURES = [
  "AI-powered simulations",
  "Interactive disaster quizzes",
  "Personalized learning paths",
  "Guided emergency response training",
];

const INITIAL_FORM: RegisterFormData = {
  fullName: "",
  email: "",
  institution: "",
  department: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  type ErrorField = keyof RegisterFormData;

  function update<K extends keyof RegisterFormData>(
    key: K,
    value: RegisterFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));

    if (
      key === "fullName" ||
      key === "email" ||
      key === "institution" ||
      key === "department" ||
      key === "password" ||
      key === "confirmPassword" ||
      key === "agreeToTerms"
    ) {
      setErrors((prev) => {
        const next = { ...prev };

        delete next[key];

        if (key === "password") {
          delete next.confirmPassword;
        }

        return next;
      });
    }
  }

  function validate(): boolean {
    const nextErrors: RegisterFormErrors = {};

    if (!isRequired(form.fullName))
      nextErrors.fullName = "Full name is required.";

    if (!isRequired(form.email)) {
      nextErrors.email = "Email address is required.";
    } else if (!isValidEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!isRequired(form.institution))
      nextErrors.institution = "College / school name is required.";

    if (!isRequired(form.department))
      nextErrors.department = "Department is required.";

    if (!isRequired(form.password)) {
      nextErrors.password = "Password is required.";
    } else if (!isStrongEnoughPassword(form.password)) {
      nextErrors.password = "Use at least 8 characters.";
    }

    if (!isRequired(form.confirmPassword)) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (!form.agreeToTerms) {
      nextErrors.agreeToTerms = "You must agree to the Terms & Privacy Policy.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      setToast({
        type: "error",
        message: "Please fix the highlighted fields.",
      });

      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          institution: form.institution,
          department: form.department,
          yearOfStudy: form.yearOfStudy || "",
        }),
      });

      const data = await res.json();

      setLoading(false);

      if (!res.ok) {
        setToast({
          type: "error",
          message: data.error || "Failed to create account.",
        });

        return;
      }

      setToast({
        type: "success",
        message: "Student account created successfully! Welcome.",
      });
      router.push("/user/dashboard");
    } catch (err) {
      setLoading(false);
      setToast({
        type: "error",
        message: "Network error occurred while registering.",
      });
    }
  }

  return (
    <AuthLayout
      description="Learn disaster preparedness through AI-powered education, interactive simulations, quizzes and personalized guidance."
      features={FEATURES}
      heading="Join SafeGraph AI"
      illustrationVariant="cap"
    >
      <div className="animate-[fadeIn_0.5s_ease-out] rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-[0_4px_24px_-4px_rgba(17,24,39,0.06)] sm:p-9">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold tracking-tight text-[#111827]">
            Create Student Account
          </h2>
          <p className="mt-1.5 text-sm text-[#6B7280]">
            Start your disaster preparedness learning journey.
          </p>
        </div>
        <form noValidate className="space-y-5" onSubmit={handleSubmit}>
          <Input
            autoComplete="name"
            error={errors.fullName}
            icon={<User size={18} strokeWidth={1.75} />}
            label="Full Name"
            name="fullName"
            placeholder="Jordan Lee"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />

          <Input
            autoComplete="email"
            error={errors.email}
            icon={<Mail size={18} strokeWidth={1.75} />}
            label="Email Address"
            name="email"
            placeholder="you@university.edu"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />

          <Input
            error={errors.institution}
            icon={<Building2 size={18} strokeWidth={1.75} />}
            label="College / School Name"
            name="institution"
            placeholder="Riverside State University"
            value={form.institution}
            onChange={(e) => update("institution", e.target.value)}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              error={errors.department}
              icon={<BookOpen size={18} strokeWidth={1.75} />}
              label="Department"
              name="department"
              placeholder="Computer Science"
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
            />
          </div>

          <PasswordInput
            showStrength
            autoComplete="new-password"
            error={errors.password}
            label="Password"
            name="password"
            placeholder="Create a password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />

          <PasswordInput
            autoComplete="new-password"
            error={errors.confirmPassword}
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
          />

          <Checkbox
            checked={form.agreeToTerms}
            error={errors.agreeToTerms}
            label={
              <>
                I agree to the{" "}
                <Link
                  className="font-medium text-[#10B981] hover:underline"
                  href="/terms"
                >
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link
                  className="font-medium text-[#10B981] hover:underline"
                  href="/privacy"
                >
                  Privacy Policy
                </Link>
                .
              </>
            }
            name="agreeToTerms"
            onChange={(e) => update("agreeToTerms", e.target.checked)}
          />

          <Button icon={<UserPlus size={18} />} loading={loading} type="submit">
            Create Student Account
          </Button>

          <Divider label="or" />

          <SocialButton
            onClick={() =>
              setToast({
                type: "success",
                message: "Google sign-up is a placeholder in this demo.",
              })
            }
          />
        </form>

        <p className="mt-7 text-center text-sm text-[#6B7280]">
          Already have an account?{" "}
          <Link
            className="font-semibold text-[#10B981] transition-colors hover:text-[#0D9268] focus:outline-none focus-visible:underline"
            href="/login"
          >
            Log in
          </Link>
        </p>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </AuthLayout>
  );
}
