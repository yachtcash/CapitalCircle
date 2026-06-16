import type { Metadata } from "next";
import CalendarWorkspace from "@/components/calendar/CalendarWorkspace";

export const metadata: Metadata = {
  title: "Calendar — Capital Circle",
  description:
    "Operational calendar — meetings, calls, property tours, due diligence, deadlines, and tasks across month, week, day, and agenda views.",
};

export default function CalendarPage() {
  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-8 md:py-10">
        <CalendarWorkspace />
      </div>
    </div>
  );
}
