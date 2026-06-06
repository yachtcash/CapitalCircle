import type { Metadata } from "next";
import MessagesWorkspace from "@/components/messages/MessagesWorkspace";

export const metadata: Metadata = {
  title: "Messages",
  description:
    "Private conversations, document exchange, and negotiation workflows with vetted sponsors on Capital Circle.",
};

type RawSearchParams = Record<string, string | string[] | undefined>;

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  const raw = sp.conversation;
  const initialConversationId =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] ?? null : null;

  return <MessagesWorkspace initialConversationId={initialConversationId} />;
}
