import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/components/app/operational-pages";
export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [
    { title: "Notifications — SwasthyaSetu-AI" },
    { name: "description", content: "Priority operational alerts and synchronization updates." },
    { property: "og:title", content: "Notifications — SwasthyaSetu-AI" },
    { property: "og:description", content: "Priority operational alerts and synchronization updates." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: NotificationsPage,
});
