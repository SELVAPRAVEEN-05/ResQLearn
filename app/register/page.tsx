"use client";

import AuthLayout from "@/components/auth/authLayout";
import SocialButton from "@/components/auth/socialButton";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Divider from "@/components/ui/divider";
import Input from "@/components/ui/input";
import PasswordInput from "@/components/ui/passwordInput";
import SelectField from "@/components/ui/selectField";
import Toast from "@/components/ui/toast";
import {
    isRequired,
    isStrongEnoughPassword,
    isValidEmail,
} from "@/lib/validation";
import type {
    RegisterFormData,
    RegisterFormErrors,
    ToastState,
} from "@/types/auth";
import {
    BadgeCheck,
    BookOpen,
    Building2,
    Info,
    Mail,
    User,
    UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";

const FEATURES = [
  "AI-powered simulations",
  "Interactive disaster quizzes",
  "Personalized learning paths",
  "Guided emergency response training",
];

const YEAR_OPTIONS = ["First Year", "Second Year", "Third Year", "Fourth Year"];

const INITIAL_FORM: RegisterFormData = {
  fullName: "",
  email: "",
  institution: "",
  department: "",
  yearOfStudy: "",
  studentId: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
};

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  function update<K extends keyof RegisterFormData>(
    key: K,
    value: RegisterFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
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

    if (!form.yearOfStudy)
      nextErrors.yearOfStudy = "Select your year of study.";

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      setToast({
        type: "error",
        message: "Please fix the highlighted fields.",
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToast({
        type: "success",
        message: "Student account created. You can now sign in.",
      });
    }, 1400);
  }

  return (
    <AuthLayout
      heading="Join SafeGraph AI"
      description="Learn disaster preparedness through AI-powered education, interactive simulations, quizzes and personalized guidance."
      features={FEATURES}
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
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Input
            label="Full Name"
            name="fullName"
            autoComplete="name"
            placeholder="Jordan Lee"
            icon={<User size={18} strokeWidth={1.75} />}
            value={form.fullName}
            error={errors.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@university.edu"
            icon={<Mail size={18} strokeWidth={1.75} />}
            value={form.email}
            error={errors.email}
            onChange={(e) => update("email", e.target.value)}
          />

          <Input
            label="College / School Name"
            name="institution"
            placeholder="Riverside State University"
            icon={<Building2 size={18} strokeWidth={1.75} />}
            value={form.institution}
            error={errors.institution}
            onChange={(e) => update("institution", e.target.value)}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Department"
              name="department"
              placeholder="Computer Science"
              icon={<BookOpen size={18} strokeWidth={1.75} />}
              value={form.department}
              error={errors.department}
              onChange={(e) => update("department", e.target.value)}
            />

            <SelectField
              label="Year of Study"
              name="yearOfStudy"
              placeholder="Select year"
              options={YEAR_OPTIONS}
              value={form.yearOfStudy}
              error={errors.yearOfStudy}
              onChange={(e) =>
                update(
                  "yearOfStudy",
                  e.target.value as RegisterFormData["yearOfStudy"],
                )
              }
            />
          </div>

          <Input
            label="Student ID"
            name="studentId"
            placeholder="Optional"
            icon={<BadgeCheck size={18} strokeWidth={1.75} />}
            value={form.studentId}
            onChange={(e) => update("studentId", e.target.value)}
          />

          <PasswordInput
            label="Password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a password"
            showStrength
            value={form.password}
            error={errors.password}
            onChange={(e) => update("password", e.target.value)}
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            error={errors.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
          />

          <Checkbox
            label={
              <>
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-medium text-[#10B981] hover:underline"
                >
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-[#10B981] hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </>
            }
            name="agreeToTerms"
            checked={form.agreeToTerms}
            error={errors.agreeToTerms}
            onChange={(e) => update("agreeToTerms", e.target.checked)}
          />

          <Button type="submit" loading={loading} icon={<UserPlus size={18} />}>
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
            href="/login"
            className="font-semibold text-[#10B981] transition-colors hover:text-[#0D9268] focus:outline-none focus-visible:underline"
          >
            Log in
          </Link>
        </p>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </AuthLayout>
  );
}
