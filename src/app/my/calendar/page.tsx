import type { Metadata } from "next";
import MyCalendarClient from "@/components/my/MyCalendarClient";

export const metadata: Metadata = {
  title: "My Calendar",
  description:
    "Your meetings, calls, site visits, introductions, and reminders on Capital Circle.",
};

export default function MyCalendarPage() {
  return <MyCalendarClient />;
}
