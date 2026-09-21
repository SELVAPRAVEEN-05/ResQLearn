import { Metadata } from "next";
import UserLayoutClient from "./UserLayoutClient";

export const metadata: Metadata = {
  title: "Student Dashboard | SafeGraph AI",
  description: "SafeGraph AI Student Disaster Preparedness & Learning Portal.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserLayoutClient>{children}</UserLayoutClient>;
}
