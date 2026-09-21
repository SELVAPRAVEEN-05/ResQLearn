import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description: "Sign in to SafeGraph AI Disaster Preparedness Education.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
