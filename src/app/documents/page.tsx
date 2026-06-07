import type { Metadata } from "next";
import DocumentCenterClient from "@/components/documents/DocumentCenterClient";

export const metadata: Metadata = {
  title: "Document Center",
  description:
    "Manage every document across your data rooms, review access requests, and audit activity — all in one private vault.",
};

export default function DocumentCenterPage() {
  return <DocumentCenterClient />;
}
