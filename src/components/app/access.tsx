import { Link } from "@tanstack/react-router";
import { BadgeCheck, Clock, Lock, ShieldAlert, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useAccount, type Account } from "@/hooks/use-account";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function VerifiedTick() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <BadgeCheck className="inline size-4 text-success" aria-label="Hospital affiliation verified." />
        </TooltipTrigger>
        <TooltipContent>Hospital affiliation verified.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function VerificationStatusCard({ account }: { account: Account }) {
  const p = account.profile;
  if (p.account_type !== "hospital_staff") return null;
  const map = {
    pending: { icon: Clock, title: "Verification Pending", cls: "border-warning/40 bg-warning-soft text-warning-foreground", text: "Your hospital information and ID card have been submitted for verification. We will verify the information with the registered hospital before enabling hospital management features." },
    verified: { icon: BadgeCheck, title: "Hospital Staff Verified", cls: "border-success/30 bg-success-soft text-success", text: "Hospital affiliation verified. Hospital management features are enabled." },
    rejected: { icon: XCircle, title: "Verification Rejected", cls: "border-destructive/30 bg-destructive-soft text-destructive", text: "Update your hospital details or ID card on your profile to apply again." },
    more_info: { icon: ShieldAlert, title: "Additional Information Required", cls: "border-warning/40 bg-warning-soft text-warning-foreground", text: "The verifier needs more information. Update your profile to resubmit." },
    not_applicable: { icon: Clock, title: "", cls: "", text: "" },
  } as const;
  const s = map[p.verification_status];
  const Icon = s.icon;
  return (
    <div className={`rounded-md border p-4 ${s.cls}`} role="status">
      <p className="flex items-center gap-2 text-sm font-bold"><Icon className="size-4" />{s.title}</p>
      <p className="mt-1 text-sm text-foreground/80">{s.text}</p>
      {p.verification_note && p.verification_status !== "verified" && <p className="mt-2 text-sm text-foreground"><b>Reason:</b> {p.verification_note}</p>}
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-foreground/80">
        <div><dt className="font-semibold">Hospital</dt><dd>{p.hospital_name || "—"}</dd></div>
        <div><dt className="font-semibold">Hospital ID</dt><dd>{p.hospital_id || "—"}</dd></div>
      </dl>
      {!p.id_card_path && p.verification_status !== "verified" && (
        <p className="mt-3 text-xs font-semibold">Hospital ID card not attached yet — <Link to="/profile" className="underline">upload it on your profile</Link>.</p>
      )}
    </div>
  );
}

export function RequireAccess({ need, children }: { need: "staff" | "admin"; children: ReactNode }) {
  const { data: account, isLoading } = useAccount();
  if (isLoading) return <div className="space-y-3 p-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-64 w-full" /></div>;
  const ok = account && (need === "admin" ? account.isAdmin : account.canManageHospital);
  if (ok) return <>{children}</>;
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="max-w-md">
        <CardContent className="space-y-4 p-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted"><Lock className="size-5" /></div>
          <h1 className="text-xl font-bold">Access Restricted</h1>
          <p className="text-sm text-muted-foreground">
            {need === "admin" ? "This area is only available to authorized administrators." : account?.profile.account_type === "hospital_staff" ? "Hospital management features are enabled once your hospital affiliation is verified." : "This area is only available to verified hospital staff."}
          </p>
          {account && need === "staff" && <VerificationStatusCard account={account} />}
          <Button asChild><Link to="/dashboard">Back to dashboard</Link></Button>
        </CardContent>
      </Card>
    </main>
  );
}

export function StaffOnly({ children }: { children: ReactNode }) {
  const { data } = useAccount();
  return data?.canManageHospital ? <>{children}</> : null;
}
