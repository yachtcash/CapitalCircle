import type { Metadata } from "next";
import NotificationCenterClient from "@/components/notifications/NotificationCenterClient";
import RoleGate from "@/components/common/RoleGate";

export const metadata: Metadata = {
  title: "Notifications",
  description:
    "Deal movement, introductions, listings, documents, and platform activity — the Capital Circle notification center.",
};

export default function NotificationsPage() {
  return (
    <RoleGate>
      <NotificationCenterClient />
    </RoleGate>
  );
}
