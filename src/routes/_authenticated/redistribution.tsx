import { RequireAccess } from "@/components/app/access";
import { createFileRoute } from "@tanstack/react-router";
import { RedistributionPage } from "@/components/app/operational-pages";
export const Route = createFileRoute("/_authenticated/redistribution")({
  head: () => ({ meta: [
    { title: "Redistribution — SwasthyaSetu-AI" },
    { name: "description", content: "Human-approved resource redistribution recommendations." },
    { property: "og:title", content: "Redistribution — SwasthyaSetu-AI" },
    { property: "og:description", content: "Human-approved resource redistribution recommendations." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <RequireAccess need="staff"><RedistributionPage/></RequireAccess>,
});
