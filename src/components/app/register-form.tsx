import { useState } from "react";
import { z } from "zod";
import { Hospital, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { savePendingIdCard } from "@/hooks/use-account";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const base = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().regex(/^[+0-9 ()-]{7,20}$/, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});
const staff = base.extend({
  hospital_name: z.string().trim().min(2, "Enter the hospital name").max(150),
  hospital_id: z.string().trim().min(2, "Enter your hospital / employee ID").max(50),
  hospital_state: z.string().trim().min(2, "Enter the state").max(60),
  hospital_district: z.string().trim().min(2, "Enter the district").max(60),
});
const ID_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export function RegisterForm({ onDone }: { onDone: () => void }) {
  const [type, setType] = useState<"normal_user" | "hospital_staff">("normal_user");
  const [f, setF] = useState<Record<string, string>>({});
  const [idCard, setIdCard] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const schema = type === "hospital_staff" ? staff : base;
    const r = schema.safeParse(f);
    const errs: Record<string, string> = {};
    if (!r.success) r.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
    if (type === "hospital_staff") {
      if (!idCard) errs.id_card = "Attach your hospital ID card";
      else if (!ID_TYPES.includes(idCard.type)) errs.id_card = "Use JPG, PNG or PDF";
      else if (idCard.size > 10 * 1024 * 1024) errs.id_card = "File must be under 10 MB";
    }
    setErrors(errs);
    if (Object.keys(errs).length || !r.success) return;
    setBusy(true);
    const { password, email, ...meta } = r.data as Record<string, string>;
    const { data, error } = await supabase.auth.signUp({
      email: email!, password: password!,
      options: { emailRedirectTo: window.location.origin + "/dashboard", data: { ...meta, account_type: type } },
    });
    if (!error && idCard) await savePendingIdCard(idCard).catch(() => undefined);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (data.session) { window.location.href = "/dashboard"; return; }
    setSent(true);
  }

  if (sent) return (
    <Card><CardContent className="space-y-3 p-6 text-center">
      <ShieldCheck className="mx-auto size-8 text-primary" />
      <h2 className="text-xl font-bold">Check your email</h2>
      <p className="text-sm text-muted-foreground">Confirm your email address, then sign in on this device.{type === "hospital_staff" && " Your hospital ID card will be submitted for verification when you first sign in."}</p>
      <Button onClick={onDone} className="w-full">Go to sign in</Button>
    </CardContent></Card>
  );

  const field = (k: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <Label htmlFor={`r-${k}`}>{label}</Label>
      <Input id={`r-${k}`} className="mt-2" value={f[k] ?? ""} onChange={set(k)} aria-invalid={!!errors[k]} {...props} />
      {errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <Card>
      <CardHeader><CardTitle className="text-2xl">Create your account</CardTitle><p className="text-sm text-muted-foreground">Choose how you'll use SwasthyaSetu-AI.</p></CardHeader>
      <CardContent>
        <div role="radiogroup" aria-label="Account type" className="mb-5 grid grid-cols-2 gap-2">
          {([["hospital_staff", "Hospital Staff", Hospital], ["normal_user", "Normal User", User]] as const).map(([v, label, Icon]) => (
            <button key={v} type="button" role="radio" aria-checked={type === v} onClick={() => setType(v)}
              className={`flex flex-col items-center gap-2 rounded-md border p-3 text-sm font-semibold ${type === v ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground"}`}>
              <Icon className="size-5" />{label}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <p className="text-xs font-bold uppercase text-muted-foreground">Personal information</p>
          {field("full_name", "Full name", { autoComplete: "name" })}
          {field("email", "Email", { type: "email", autoComplete: "email" })}
          {field("phone", "Phone number", { type: "tel", autoComplete: "tel" })}
          {field("password", "Password", { type: "password", autoComplete: "new-password" })}
          <p className="text-xs text-muted-foreground">You can add a profile picture after signing in.</p>
          {type === "hospital_staff" && (
            <>
              <p className="pt-2 text-xs font-bold uppercase text-muted-foreground">Hospital information</p>
              {field("hospital_name", "Hospital name")}
              {field("hospital_id", "Hospital ID / Employee ID")}
              <div className="grid grid-cols-2 gap-3">{field("hospital_state", "State")}{field("hospital_district", "District")}</div>
              <div>
                <Label htmlFor="r-id">Hospital ID card</Label>
                <Input id="r-id" type="file" accept="image/jpeg,image/png,application/pdf" capture="environment" className="mt-2" onChange={(e) => setIdCard(e.target.files?.[0] ?? null)} />
                <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or PDF · camera capture supported on phones.</p>
                {errors.id_card && <p className="mt-1 text-xs text-destructive">{errors.id_card}</p>}
              </div>
              <div className="rounded-md border border-warning/40 bg-warning-soft p-3 text-xs text-warning-foreground">
                Your hospital affiliation must be verified before hospital-resource management features are enabled.<br />
                Your verification documents are used only for account verification.
              </div>
            </>
          )}
          <Button className="w-full" type="submit" disabled={busy}>{busy ? "Creating account…" : "Create account"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
