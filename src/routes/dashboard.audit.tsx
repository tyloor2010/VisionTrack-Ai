import { createFileRoute } from "@tanstack/react-router";
import { AdminCenter } from "@/components/vt/AdminCenter";
export const Route = createFileRoute("/dashboard/audit")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Audit Explorer — VisionTrack AI v2" }, { name: "description", content: "Search and export role-based demonstration activity and verify its illustrative checksum chain." }, { property: "og:title", content: "Audit Explorer — VisionTrack AI v2" }, { property: "og:description", content: "Filter demo activity by role, action, case and date." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <AdminCenter page="audit" />,
});