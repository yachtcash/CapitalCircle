import type { ReactNode } from "react";
import DashboardSubnav from "@/components/dashboard/DashboardSubnav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DashboardSubnav />
      {children}
    </>
  );
}
