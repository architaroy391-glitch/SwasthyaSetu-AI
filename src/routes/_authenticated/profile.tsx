import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle, Camera, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { VerificationStatusCard, VerifiedTick } from "@/components/app/access";
import { UserAvatar, roleLabel } from "@/components/app/profile-menu";
import { useAccount, useRefreshAccount, uploadIdCard } from "@/hooks/use-account";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/profile")({
  validateSearch: (s: Record<string, unknown>) => ({ edit: s.edit === true || s.edit === "true" ? true : undefined }),
  head: () => ({ meta: [
    { title: "Profile — SwasthyaSetu-AI" },
    { name: "description", content: "Manage your profile, photo, and hospital verification." },
    { property: "og:title", content: "Profile — SwasthyaSetu-AI" },
    { property: "og:description", content: "Manage your profile, photo, and hospital verification." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ProfilePage,
});

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(100),
  phone: z.string().trim().regex(/^[+0-9 ()-]{7,20}$/, "Enter a valid phone number").or(z.literal("")),
  hospital_name: z.string().trim().max(150),
  hospital_id: z.string().trim().max(50),
});

function ProfilePage() {
  const { edit } = Route.useSearch();
  const { data: acc } = useAccount();
  const refresh = useRefreshAccount();
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  const [form, setForm] = useState({ full_name: "", phone: "", hospital_name: "", hospital_id: "" });
  const [idCard, setIdCard] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (acc) setForm({ full_name: acc.profile.full_name ?? "", phone: acc.profile.phone ?? "", hospital_name: acc.profile.hospital_name ?? "", hospital_id: acc.profile.hospital_id ?? "" });
  }, [acc]);
  useEffect(() => { if (edit) formRef.current?.scrollIntoView({ behavior: "smooth" }); }, [edit, acc]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview]);

  if (!acc) return <AppShell title="Profile" subtitle="Your account"><p className="text-sm text-muted-foreground">Loading…</p></AppShell>;
  const staff = acc.profile.account_type === "hospital_staff";
  const hospitalChanged = staff && (form.hospital_name !== (acc.profile.hospital_name ?? "") || form.hospital_id !== (acc.profile.hospital_id ?? "") || !!idCard);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) return toast.error("Use a JPG, PNG or WEBP image.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Photo must be under 5 MB.");
    setPreview({ file, url: URL.createObjectURL(file) });
  }
  async function savePhoto() {
    if (!preview || !acc) return;
    setBusy(true);
    const path = `${acc.userId}/avatar-${Date.now()}.${preview.file.type.split("/")[1]}`;
    const { error } = await supabase.storage.from("avatars").upload(path, preview.file, { contentType: preview.file.type });
    if (!error) {
      const old = acc.profile.avatar_url;
      await supabase.from("profiles").update({ avatar_url: path }).eq("id", acc.userId);
      if (old) await supabase.storage.from("avatars").remove([old]);
    }
    setBusy(false);
    if (error) return toast.error("Couldn't upload the photo. Try again.");
    setPreview(null); await refresh(); toast.success("Profile photo updated.");
  }
  async function removePhoto() {
    if (!acc?.profile.avatar_url) return;
    setBusy(true);
    await supabase.storage.from("avatars").remove([acc.profile.avatar_url]);
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", acc.userId);
    setBusy(false); await refresh(); toast.success("Profile photo removed.");
  }
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!acc) return;
    const r = schema.safeParse(form);
    if (!r.success) return toast.error(r.error.issues[0]?.message ?? "Check the form");
    if (staff && (!r.data.hospital_name || !r.data.hospital_id)) return toast.error("Hospital name and ID are required.");
    setBusy(true);
    try {
      const update: Record<string, string | null> = { full_name: r.data.full_name, phone: r.data.phone || null };
      if (staff) { update.hospital_name = r.data.hospital_name; update.hospital_id = r.data.hospital_id; }
      if (staff && idCard) update.id_card_path = await uploadIdCard(acc.userId, idCard);
      const { error } = await supabase.from("profiles").update(update).eq("id", acc.userId);
      if (error) throw error;
      setIdCard(null); await refresh();
      toast.success(hospitalChanged ? "Saved. Your hospital details were sent for verification." : "Profile updated.");
    } catch { toast.error("Couldn't save your profile. Try again."); }
    setBusy(false);
  }

  return (
    <AppShell title="Profile" subtitle="Your account and verification">
      <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            {preview ? <img src={preview.url} alt="New profile photo preview" className="size-32 rounded-full object-cover" /> : <UserAvatar className="size-32 text-3xl" />}
            <div>
              <p className="flex items-center justify-center gap-1 text-lg font-bold">{acc.profile.full_name || acc.email}{acc.isVerifiedStaff && <VerifiedTick />}</p>
              <p className="text-sm text-muted-foreground">{roleLabel(acc.role, acc.isVerifiedStaff, acc.profile.verification_status)}</p>
            </div>
            {preview ? (
              <div className="flex gap-2"><Button size="sm" onClick={savePhoto} disabled={busy}>Save photo</Button><Button size="sm" variant="outline" onClick={() => setPreview(null)}>Cancel</Button></div>
            ) : (
              <div className="flex flex-wrap justify-center gap-2">
                <Button size="sm" variant="outline" asChild><label className="cursor-pointer"><Camera />Change Photo<input type="file" accept="image/jpeg,image/png,image/webp" capture="user" className="sr-only" onChange={pick} /></label></Button>
                {acc.profile.avatar_url && <Button size="sm" variant="ghost" onClick={removePhoto} disabled={busy}><Trash2 />Remove Photo</Button>}
              </div>
            )}
            <p className="text-xs text-muted-foreground">JPG, PNG or WEBP · up to 5 MB</p>
          </CardContent>
        </Card>
        <div className="space-y-4">
          {staff && <VerificationStatusCard account={acc} />}
          <Card ref={formRef}>
            <CardHeader><CardTitle className="text-base">Update Profile</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={saveProfile} className="space-y-4">
                <div><Label htmlFor="p-name">Name</Label><Input id="p-name" className="mt-2" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
                <div><Label htmlFor="p-email">Email</Label><Input id="p-email" className="mt-2" value={acc.email} disabled /></div>
                <div><Label htmlFor="p-phone">Phone number</Label><Input id="p-phone" type="tel" className="mt-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                {staff && (
                  <>
                    <div><Label htmlFor="p-hn">Hospital name</Label><Input id="p-hn" className="mt-2" value={form.hospital_name} onChange={(e) => setForm({ ...form, hospital_name: e.target.value })} /></div>
                    <div><Label htmlFor="p-hid">Hospital ID</Label><Input id="p-hid" className="mt-2" value={form.hospital_id} onChange={(e) => setForm({ ...form, hospital_id: e.target.value })} /></div>
                    <div><Label htmlFor="p-card">{acc.profile.id_card_path ? "Replace hospital ID card" : "Upload hospital ID card"}</Label><Input id="p-card" type="file" accept="image/jpeg,image/png,application/pdf" capture="environment" className="mt-2" onChange={(e) => setIdCard(e.target.files?.[0] ?? null)} /><p className="mt-1 text-xs text-muted-foreground">Your verification documents are used only for account verification.</p></div>
                    {hospitalChanged && (
                      <div className="flex gap-2 rounded-md border border-warning/40 bg-warning-soft p-3 text-sm text-warning-foreground" role="alert">
                        <AlertTriangle className="size-4 shrink-0" />
                        <p><b>Verification Required.</b> Changing your hospital information requires verification again. Your hospital management permissions will remain restricted until the new information is verified.</p>
                      </div>
                    )}
                  </>
                )}
                <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
