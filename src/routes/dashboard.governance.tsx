import { createFileRoute } from "@tanstack/react-router";
import { AdminCenter } from "@/components/vt/AdminCenter";
export const Route = createFileRoute("/dashboard/governance")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Privacy Governance — VisionTrack AI v2" }, { name: "description", content: "Preview demonstration retention policies, legal holds, consent withdrawals and data-subject requests." }, { property: "og:title", content: "Privacy Governance — VisionTrack AI v2" }, { property: "og:description", content: "Demo retention and consent tools without automatic case deletion." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <AdminCenter page="governance" />,
});