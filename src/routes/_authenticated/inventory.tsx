import { createFileRoute } from "@tanstack/react-router";
import { InventoryPage } from "@/components/app/operational-pages";
export const Route = createFileRoute("/_authenticated/inventory")({
  head: () => ({ meta: [
    { title: "Inventory — SwasthyaSetu-AI" },
    { name: "description", content: "Medicine inventory and offline stock updates." },
    { property: "og:title", content: "Inventory — SwasthyaSetu-AI" },
    { property: "og:description", content: "Medicine inventory and offline stock updates." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: InventoryPage,
});
