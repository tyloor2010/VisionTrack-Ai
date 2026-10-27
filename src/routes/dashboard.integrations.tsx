import { createFileRoute } from "@tanstack/react-router";
import { AdminCenter } from "@/components/vt/AdminCenter";
export const Route = createFileRoute("/dashboard/integrations")({
  head: () => ({ meta: [{ title: "Integration Sandbox — VisionTrack AI v2" }, { name: "description", content: "Demonstrate partner connections, scoped mock API identifiers and webhook test delivery without external transmissions." }, { property: "og:title", content: "Integration Sandbox — VisionTrack AI v2" }, { property: "og:description", content: "Mock connections and webhook delivery tests for the VisionTrack demo." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <AdminCenter page="integrations" />,
});