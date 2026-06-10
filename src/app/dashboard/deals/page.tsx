import { redirect } from "next/navigation";

// The Deal Desk graduated to a top-level surface. Old bookmarks land here.
export default function LegacyDealsRedirect() {
  redirect("/deal-desk");
}
