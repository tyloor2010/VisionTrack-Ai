import { createFileRoute } from "@tanstack/react-router";
import { Analytics } from "@/components/vt/Analytics";
export const Route = createFileRoute("/dashboard/analytics")({
  staticData: { sitemap: false },
  head: () => ({meta:[{title:"Analytics & Reports — VisionTrack AI"},{name:"description",content:"Explore demo case outcomes, review feedback, date comparisons and downloadable reports."},{property:"og:title",content:"Analytics & Reports — VisionTrack AI"},{property:"og:description",content:"Demo search outcomes and human review reports."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),
  component: Analytics,
});
