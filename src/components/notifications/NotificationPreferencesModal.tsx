"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useMessaging } from "@/components/providers/MessagingProvider";
import {
  NOTIFICATION_CATEGORIES,
  type NotificationChannelPrefs,
} from "@/data/notifications/types";
import { cn } from "@/lib/cn";

const CHANNELS: { key: keyof NotificationChannelPrefs; label: string; future?: boolean }[] = [
  { key: "inApp", label: "In-app" },
  { key: "email", label: "Email", future: true },
  { key: "sms", label: "SMS", future: true },
  { key: "push", label: "Push", future: true },
];

/**
 * Per-category notification preferences. Only the preference is stored —
 * email / SMS / push delivery integrations consume these later.
 */
export default function NotificationPreferencesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { notificationPrefs, setNotificationPreference } = useMessaging();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Notification preferences"
      description="Choose which categories notify you. Email, SMS, and push are stored now and delivered once those channels launch."
      maxWidth="lg"
      footer={<Button onClick={onClose}>Done</Button>}
    >
      <div className="rounded-xl ring-1 ring-navy-900/[0.06] overflow-hidden">
        <div className="grid grid-cols-[1fr_repeat(4,56px)] items-center gap-1 px-3 py-2 bg-bone/50 border-b border-navy-900/[0.06]">
          <span className="text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-bold">
            Category
          </span>
          {CHANNELS.map((c) => (
            <span
              key={c.key}
              className="text-[9px] uppercase tracking-[0.1em] text-navy-700/55 font-bold text-center"
            >
              {c.label}
            </span>
          ))}
        </div>
        <ul className="divide-y divide-navy-900/[0.05] max-h-[50vh] overflow-y-auto">
          {NOTIFICATION_CATEGORIES.map((category) => {
            const prefs = notificationPrefs[category];
            return (
              <li
                key={category}
                className="grid grid-cols-[1fr_repeat(4,56px)] items-center gap-1 px-3 py-2"
              >
                <span className="text-sm font-medium text-navy-900">{category}</span>
                {CHANNELS.map((c) => {
                  const onValue = prefs?.[c.key] ?? false;
                  return (
                    <span key={c.key} className="flex justify-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={onValue}
                        aria-label={`${c.label} notifications for ${category}${c.future ? " (coming soon)" : ""}`}
                        title={c.future ? "Stored now — delivered when this channel launches" : undefined}
                        onClick={() => setNotificationPreference(category, { [c.key]: !onValue })}
                        className={cn(
                          "relative h-5 w-9 rounded-full ring-1 transition-colors",
                          onValue
                            ? c.future
                              ? "bg-navy-900/30 ring-navy-900/20"
                              : "bg-gold-500 ring-gold-500"
                            : "bg-navy-900/[0.08] ring-navy-900/15"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
                            onValue ? "left-[18px]" : "left-0.5"
                          )}
                        />
                      </button>
                    </span>
                  );
                })}
              </li>
            );
          })}
        </ul>
      </div>
      <p className="mt-3 text-xs text-navy-700/55 leading-relaxed">
        Disabling a category stops new in-app notifications for it. Existing
        notifications are kept.
      </p>
    </Modal>
  );
}
