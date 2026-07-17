import type { Metadata } from "next";
import RoleGate from "@/components/common/RoleGate";
import CommandCenterClient from "@/components/command/CommandCenterClient";

export const metadata: Metadata = {
  title: "Command Center",
  description:
    "The Capital Circle operational command center — marketplace health, live activity, top opportunities, sponsor and deal intelligence, and pending actions in one view.",
};

export default function CommandCenterPage() {
  return (
    <RoleGate min="Admin">
      <CommandCenterClient />
    </RoleGate>
  );
}
