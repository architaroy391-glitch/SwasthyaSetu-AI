import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/app/operational-pages";
export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [
    { title: "Settings — SwasthyaSetu-AI" },
    { name: "description", content: "Facility, role, notification, connectivity, and privacy settings." },
    { property: "og:title", content: "Settings — SwasthyaSetu-AI" },
    { property: "og:description", content: "Facility, role, notification, connectivity, and privacy settings." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: SettingsPage,
});
