import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/app/operational-pages";
export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [
    { title: "Dashboard — SwasthyaSetu-AI" },
    { name: "description", content: "Healthcare resource command centre overview." },
    { property: "og:title", content: "Dashboard — SwasthyaSetu-AI" },
    { property: "og:description", content: "Healthcare resource command centre overview." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: DashboardPage,
});
