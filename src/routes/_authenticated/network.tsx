import { createFileRoute } from "@tanstack/react-router";
import { NetworkPage } from "@/components/app/operational-pages";
export const Route = createFileRoute("/_authenticated/network")({
  head: () => ({ meta: [
    { title: "Network — SwasthyaSetu-AI" },
    { name: "description", content: "Interactive healthcare facility resource network." },
    { property: "og:title", content: "Network — SwasthyaSetu-AI" },
    { property: "og:description", content: "Interactive healthcare facility resource network." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: NetworkPage,
});
