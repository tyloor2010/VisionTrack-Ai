import { createFileRoute } from "@tanstack/react-router";
import { AdminCenter } from "@/components/vt/AdminCenter";
export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({ meta: [{ title: "Demo User Administration — VisionTrack AI v2" }, { name: "description", content: "Manage demonstration users, sessions and approval-gated permission proposals in VisionTrack." }, { property: "og:title", content: "Demo User Administration — VisionTrack AI v2" }, { property: "og:description", content: "Sandbox accounts and permission proposals, not real authentication." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <AdminCenter page="users" />,
});