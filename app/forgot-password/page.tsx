"use client";

import { ArrowLeft, Mail, Send } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";

import AuthLayout from "@/components/auth/authLayout";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { isRequired, isValidEmail } from "@/lib/validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [developmentResetUrl, setDevelopmentResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setDevelopmentResetUrl("");

    if (!isRequired(email) || !isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to start password reset.");
      setMessage(data.message);
      if (data.developmentResetUrl) setDevelopmentResetUrl(data.developmentResetUrl);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to start password reset.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      description="Recover access to your SafeGraph AI learning account securely."
      features={["Secure one-time reset links", "Password hashing", "Student and admin account support"]}
      heading="Reset your password"
      illustrationVariant="shield"
    >
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-9">
        <Link className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#059669] hover:underline" href="/login">
          <ArrowLeft size={16} /> Back to login
        </Link>
        <h2 className="text-xl font-bold text-[#111827]">Forgot password?</h2>
        <p className="mt-2 text-sm leading-6 text-[#6B7280]">Enter your account email and we will send a one-time password reset link.</p>
        <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit}>
          <Input autoComplete="email" error={error} icon={<Mail size={18} />} label="Email Address" name="email" placeholder="you@university.edu" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          {message && <p className="rounded-lg bg-[#ECFDF5] p-3 text-sm leading-5 text-[#047857]" role="status">{message}</p>}
          {developmentResetUrl && <Link className="block break-all text-sm text-[#059669] underline" href={developmentResetUrl}>Open development reset link</Link>}
          <Button icon={<Send size={18} />} loading={loading} type="submit">Send Reset Link</Button>
        </form>
      </div>
    </AuthLayout>
  );
}