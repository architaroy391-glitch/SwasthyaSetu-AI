import { RequireAccess } from "@/components/app/access";
import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsPage } from "@/components/app/operational-pages";
export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [
    { title: "Analytics — SwasthyaSetu-AI" },
    { name: "description", content: "Healthcare network operations analytics." },
    { property: "og:title", content: "Analytics — SwasthyaSetu-AI" },
    { property: "og:description", content: "Healthcare network operations analytics." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <RequireAccess need="staff"><AnalyticsPage/></RequireAccess>,
});
