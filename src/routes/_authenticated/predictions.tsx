import { RequireAccess } from "@/components/app/access";
import { createFileRoute } from "@tanstack/react-router";
import { PredictionsPage } from "@/components/app/operational-pages";
export const Route = createFileRoute("/_authenticated/predictions")({
  head: () => ({ meta: [
    { title: "Predictions — SwasthyaSetu-AI" },
    { name: "description", content: "Transparent shortage forecasts and contributing factors." },
    { property: "og:title", content: "Predictions — SwasthyaSetu-AI" },
    { property: "og:description", content: "Transparent shortage forecasts and contributing factors." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <RequireAccess need="staff"><PredictionsPage/></RequireAccess>,
});
