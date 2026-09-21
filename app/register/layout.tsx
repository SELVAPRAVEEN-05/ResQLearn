import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create an account on SafeGraph AI Disaster Preparedness Education.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
