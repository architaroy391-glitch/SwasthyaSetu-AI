import { createFileRoute } from "@tanstack/react-router";
import { EmergencyPage } from "@/components/app/operational-pages";
export const Route = createFileRoute("/_authenticated/emergency")({
  head: () => ({ meta: [
    { title: "Emergency — SwasthyaSetu-AI" },
    { name: "description", content: "Emergency SOS and nearby facility coordination." },
    { property: "og:title", content: "Emergency — SwasthyaSetu-AI" },
    { property: "og:description", content: "Emergency SOS and nearby facility coordination." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: EmergencyPage,
});
