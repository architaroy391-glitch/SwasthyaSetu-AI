import { RequireAccess } from "@/components/app/access";
import { createFileRoute } from "@tanstack/react-router";
import { ResourcesPage } from "@/components/app/operational-pages";
export const Route = createFileRoute("/_authenticated/resources")({
  head: () => ({ meta: [
    { title: "Resources — SwasthyaSetu-AI" },
    { name: "description", content: "Available hospital beds, doctors, and specialists." },
    { property: "og:title", content: "Resources — SwasthyaSetu-AI" },
    { property: "og:description", content: "Available hospital beds, doctors, and specialists." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <RequireAccess need="staff"><ResourcesPage/></RequireAccess>,
});
