import { createFileRoute } from "@tanstack/react-router";
import { Analytics } from "@/components/vt/Analytics";
export const Route = createFileRoute("/dashboard/model-quality")({
  staticData: { sitemap: false },
  head: () => ({meta:[{title:"Model Quality — VisionTrack AI"},{name:"description",content:"Evaluate seeded demo precision, recall, thresholds, confusion matrix and camera and age-group gaps."},{property:"og:title",content:"Model Quality — VisionTrack AI"},{property:"og:description",content:"Transparent demo evaluation with human-review feedback."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),
  component: () => <Analytics quality />,
});
