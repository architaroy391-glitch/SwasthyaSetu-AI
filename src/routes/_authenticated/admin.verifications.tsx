import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, Eye, ShieldAlert, XCircle } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { RequireAccess } from "@/components/app/access";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/hooks/use-account";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/verifications")({
  head: () => ({ meta: [
    { title: "Hospital Verification — SwasthyaSetu-AI" },
    { name: "description", content: "Review hospital staff affiliation requests." },
    { property: "og:title", content: "Hospital Verification — SwasthyaSetu-AI" },
    { property: "og:description", content: "Review hospital staff affiliation requests." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <RequireAccess need="admin"><VerificationsPage /></RequireAccess>,
});

type Status = Profile["verification_status"];
const labels: Record<Status, string> = { pending: "Pending", verified: "Verified", rejected: "Rejected", more_info: "More info required", not_applicable: "Normal user" };
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }) : "—");

function VerificationsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [card, setCard] = useState<{ url: string; pdf: boolean } | null>(null);
  const [reasonFor, setReasonFor] = useState<{ p: Profile; status: "rejected" | "more_info" } | null>(null);
  const [reason, setReason] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["verifications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("submitted_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });
  const rows = tab === "pending" ? data.filter((p) => p.verification_status === "pending" || p.verification_status === "more_info") : data;

  async function viewCard(p: Profile) {
    if (!p.id_card_path) return toast.error("No ID card attached yet.");
    const { data } = await supabase.storage.from("id-cards").createSignedUrl(p.id_card_path, 120);
    if (!data) return toast.error("Couldn't open the ID card.");
    setCard({ url: data.signedUrl, pdf: p.id_card_path.endsWith(".pdf") });
  }
  async function decide(p: Profile, status: Status, note: string | null) {
    const { error } = await supabase.from("profiles").update({ verification_status: status, verification_note: note }).eq("id", p.id);
    if (error) return toast.error("Couldn't update the request.");
    toast.success(status === "verified" ? `${p.full_name} verified.` : "Request updated.");
    qc.invalidateQueries({ queryKey: ["verifications"] });
  }

  return (
    <AppShell title="Hospital Verification" subtitle="Confirm staff affiliation with the registered hospital">
      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">Check that the person belongs to the hospital, the hospital name and ID are correct, and the ID card matches hospital records. Verification is a human decision — nothing is approved automatically.</p>
      <Tabs value={tab} onValueChange={(v) => setTab(v as "pending" | "all")} className="mb-4"><TabsList><TabsTrigger value="pending">Pending</TabsTrigger><TabsTrigger value="all">All users</TabsTrigger></TabsList></Tabs>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : rows.length === 0 ? <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No requests waiting for review.</CardContent></Card> : (
        <div className="grid gap-3 lg:grid-cols-2">
          {rows.map((p) => (
            <Card key={p.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div><p className="font-bold">{p.full_name || p.email}</p><p className="text-xs text-muted-foreground">{p.email}</p></div>
                  <Badge variant={p.verification_status === "verified" ? "default" : p.verification_status === "rejected" ? "destructive" : "secondary"}>{labels[p.verification_status]}</Badge>
                </div>
                {p.account_type === "hospital_staff" && (
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div><dt className="text-xs text-muted-foreground">Hospital</dt><dd>{p.hospital_name}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">Hospital ID</dt><dd>{p.hospital_id}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">District / State</dt><dd>{p.hospital_district}, {p.hospital_state}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">Submitted</dt><dd>{fmt(p.submitted_at)}</dd></div>
                    {p.verified_at && <div className="col-span-2"><dt className="text-xs text-muted-foreground">Decision on</dt><dd>{fmt(p.verified_at)}{p.verification_note ? ` · ${p.verification_note}` : ""}</dd></div>}
                  </dl>
                )}
                {p.account_type === "hospital_staff" && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => viewCard(p)}><Eye />View ID Card</Button>
                    <Button size="sm" onClick={() => decide(p, "verified", null)} disabled={p.verification_status === "verified"}><BadgeCheck />Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => { setReason(""); setReasonFor({ p, status: "rejected" }); }}><XCircle />Reject</Button>
                    <Button size="sm" variant="secondary" onClick={() => { setReason(""); setReasonFor({ p, status: "more_info" }); }}><ShieldAlert />Request More Information</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={!!card} onOpenChange={(o) => !o && setCard(null)}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Hospital ID card</DialogTitle></DialogHeader>
          {card && (card.pdf ? <iframe title="ID card" src={card.url} className="h-[70vh] w-full rounded-md border" /> : <img src={card.url} alt="Submitted hospital ID card" className="max-h-[70vh] w-full rounded-md object-contain" />)}
          <p className="text-xs text-muted-foreground">Sensitive document — link expires in 2 minutes.</p>
        </DialogContent>
      </Dialog>
      <Dialog open={!!reasonFor} onOpenChange={(o) => !o && setReasonFor(null)}>
        <DialogContent><DialogHeader><DialogTitle>{reasonFor?.status === "rejected" ? "Reject verification" : "Request more information"}</DialogTitle></DialogHeader>
          <Label htmlFor="reason">{reasonFor?.status === "rejected" ? "Rejection reason (required)" : "What's needed? (required)"}</Label>
          <Textarea id="reason" value={reason} maxLength={300} onChange={(e) => setReason(e.target.value)} placeholder={reasonFor?.status === "rejected" ? "Hospital ID could not be verified." : "Please upload a clearer photo of your ID card."} />
          <DialogFooter><Button variant="outline" onClick={() => setReasonFor(null)}>Cancel</Button><Button disabled={reason.trim().length < 3} onClick={async () => { if (reasonFor) { await decide(reasonFor.p, reasonFor.status, reason.trim()); setReasonFor(null); } }}>Confirm</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
