"use client";

import { ArrowLeft, KeyRound, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import AuthLayout from "@/components/auth/authLayout";
import Button from "@/components/ui/button";
import PasswordInput from "@/components/ui/passwordInput";
import { isStrongEnoughPassword } from "@/lib/validation";

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!isStrongEnoughPassword(password)) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to reset password.");
      router.push("/login?reset=success");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      description="Choose a new password to return to your preparedness learning journey."
      features={["One-time reset token", "Secure password storage", "Immediate account access"]}
      heading="Create a new password"
      illustrationVariant="shield"
    >
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-9">
        <Link className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#059669] hover:underline" href="/login">
          <ArrowLeft size={16} /> Back to login
        </Link>
        <div className="flex items-center gap-3"><KeyRound className="text-[#10B981]" size={24} /><h2 className="text-xl font-bold text-[#111827]">Reset password</h2></div>
        <p className="mt-2 text-sm text-[#6B7280]">Your new password must be at least 8 characters.</p>
        <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit}>
          <PasswordInput autoComplete="new-password" error={error} label="New Password" name="password" placeholder="Create a new password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <PasswordInput autoComplete="new-password" label="Confirm Password" name="confirmPassword" placeholder="Re-enter your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          <Button icon={<Save size={18} />} loading={loading} type="submit">Reset Password</Button>
        </form>
      </div>
    </AuthLayout>
  );
}