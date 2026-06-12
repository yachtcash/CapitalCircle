"use client";

import { Images } from "lucide-react";
import type { Member } from "@/data/members";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { canManageMembers } from "@/lib/roles";
import MediaGalleryManager from "@/components/media/MediaGalleryManager";
import SingleImageManager from "@/components/media/SingleImageManager";

/** The signed-in member's own directory record (Stevie Cabrera). */
const OWN_MEMBER_ID = "MEM-000001";

/**
 * Member Media Manager — visible management section on the member profile.
 * The member themself (owner) plus Admin / Super Admin see it on every
 * profile. Avatar, cover, and the Portfolio & Media gallery persist through
 * the provider's member media overlay — identical IndexedDB + token +
 * localStorage architecture as the verified Opportunity Gallery Manager.
 */
export default function MemberMediaManager({ member }: { member: Member }) {
  const { getMemberLive, updateMemberMedia, recordAudit, currentRole } =
    useMessaging();

  const canManage =
    canManageMembers(currentRole) || member.id === OWN_MEMBER_ID;
  if (!canManage) return null;

  const live = getMemberLive(member.id) ?? member;

  return (
    <section
      id="member-media-manager"
      className="scroll-mt-24 rounded-3xl bg-white ring-2 ring-gold-500/40 shadow-sm p-5 md:p-7 space-y-5"
    >
      <header>
        <div className="text-[11px] uppercase tracking-[0.22em] text-gold-700 font-bold inline-flex items-center gap-1.5">
          <Images className="h-3.5 w-3.5" strokeWidth={2.4} />
          Member Media Manager
        </div>
        <h2 className="mt-1.5 text-xl md:text-2xl font-semibold text-navy-900 tracking-tight">
          Manage Gallery
        </h2>
        <p className="mt-1 text-xs text-navy-700/65 max-w-xl leading-relaxed">
          Update the avatar, cover, and the Portfolio &amp; Media gallery.
          Changes save automatically and appear on the profile, the members
          directory, and every preview immediately.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SingleImageManager
          label="Avatar"
          value={live.avatar}
          shape="square"
          fallbackText={live.initials}
          removable
          onChange={(next) => {
            updateMemberMedia(member.id, { avatar: next });
            recordAudit(
              "Member Avatar Changed",
              { kind: "member", id: member.id, label: live.name },
              next ? "Avatar replaced" : "Avatar removed"
            );
          }}
        />
        <SingleImageManager
          label="Cover Image"
          value={live.coverImage}
          shape="wide"
          removable
          onChange={(next) => {
            updateMemberMedia(member.id, { coverImage: next });
            recordAudit(
              "Member Cover Changed",
              { kind: "member", id: member.id, label: live.name },
              next ? "Cover image replaced" : "Cover image removed"
            );
          }}
        />
      </div>

      <MediaGalleryManager
        images={live.gallery ?? []}
        title={live.name}
        eyebrow="Portfolio Gallery"
        onPersist={(next) => updateMemberMedia(member.id, { gallery: next })}
        auditTarget={{ kind: "member", id: member.id }}
        auditActions={{
          uploaded: "Member Image Uploaded",
          replaced: "Member Image Replaced",
          deleted: "Member Image Deleted",
          reordered: "Member Gallery Reordered",
          cleared: "Member Gallery Cleared",
          coverChanged: "Member Cover Changed",
        }}
      />
    </section>
  );
}
