"use client";

import Link from "next/link";
import Image from "next/image";

import {
  ACTIVITY_TONE_TILE,
  ENTITY_ICON,
  ENTITY_TONE,
  type ActivityEvent,
} from "@/lib/activity/types";
import Badge from "@/components/ui/Badge";
import { timeAgo } from "@/lib/home/format";
import { cn } from "@/lib/cn";

/**
 * The one activity row. Every timeline on the platform renders this:
 * colored entity icon tile, action title, actor/detail line, optional
 * badge + thumbnail, shared relative timestamp, optional deep link.
 */
export default function ActivityItem({
  event,
  nowMs,
}: {
  event: ActivityEvent;
  nowMs: number;
}) {
  const Icon = ENTITY_ICON[event.entity];
  const tone = event.tone ?? ENTITY_TONE[event.entity];

  const body = (
    <>
      <span
        className={cn(
          "h-8 w-8 rounded-lg ring-1 inline-flex items-center justify-center shrink-0 mt-0.5",
          ACTIVITY_TONE_TILE[tone]
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-navy-900 leading-snug">
            {event.title}
          </span>
          {event.badge ? (
            <Badge size="sm" className={event.badge.className}>
              {event.badge.label}
            </Badge>
          ) : null}
        </span>
        {event.actor || event.detail ? (
          <span className="mt-0.5 block text-xs text-navy-700/60 leading-relaxed line-clamp-2">
            {event.actor ? <span className="font-medium text-navy-700/80">{event.actor}</span> : null}
            {event.actor && event.detail ? " · " : null}
            {event.detail}
          </span>
        ) : null}
      </span>
      {event.thumbnail ? (
        <span className="relative h-10 w-10 rounded-lg overflow-hidden ring-1 ring-navy-900/[0.08] shrink-0">
          <Image src={event.thumbnail} alt="" fill sizes="40px" className="object-cover" unoptimized />
        </span>
      ) : null}
      <span className="text-[11px] text-navy-700/45 tabular-nums whitespace-nowrap shrink-0 mt-0.5">
        {event.dateMs && nowMs ? timeAgo(new Date(event.dateMs).toISOString(), nowMs) : ""}
      </span>
    </>
  );

  const rowClass =
    "flex items-start gap-3 px-4 md:px-5 py-3.5 transition-colors hover:bg-cream/50";

  return (
    <li className="border-b border-navy-900/[0.05] last:border-b-0">
      {event.href ? (
        <Link href={event.href} className={rowClass}>
          {body}
        </Link>
      ) : (
        <div className={rowClass}>{body}</div>
      )}
    </li>
  );
}
