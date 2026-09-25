import { Link } from "@tanstack/react-router";
import { AlertTriangle, BedDouble, CheckCircle2, Clock, Pill, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatLast, isDue, isSnoozed, lastOf, nextMedicineUpdate, reminderMeta, snooze, useReminders, type ReminderKind } from "@/lib/reminders";
import { DemoBadge } from "./status";

const icons = { beds: BedDouble, doctors: Stethoscope, medicine: Pill };

export function useDueReminders(kinds: ReminderKind[] = ["beds", "doctors", "medicine"]) {
  const s = useReminders();
  return { state: s, due: kinds.filter((k) => isDue(k, s)), visible: kinds.filter((k) => isDue(k, s) && !isSnoozed(k, s)) };
}

export function ReminderBanners({ kinds }: { kinds?: ReminderKind[] }) {
  const { visible, state } = useDueReminders(kinds);
  if (!visible.length) return null;
  return <div className="mb-4 space-y-3">{visible.map((k) => { const m = reminderMeta[k]; const Icon = icons[k]; const overdue = new Date().getHours() >= 10 || k === "medicine"; return (
    <div key={k} role="alert" className={`flex flex-wrap items-center gap-3 rounded-md border p-4 ${overdue ? "border-warning/40 bg-warning-soft" : "border-primary/30 bg-primary-soft"}`}>
      <Icon className="size-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="font-bold">{m.title}</p>
        <p className="text-sm text-muted-foreground">{m.message}</p>
        <p className="mt-1 text-xs text-muted-foreground">Last updated: {formatLast(lastOf(k, state))}{overdue && <span className="ml-2 font-bold text-warning-foreground">⚠ {k === "beds" ? "Bed availability" : k === "doctors" ? "Doctor availability" : "Medicine inventory"} update overdue</span>}</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" asChild><Link to={m.to}>{m.cta}</Link></Button>
        <Button size="sm" variant="outline" onClick={() => snooze(k)}>Remind Me Later</Button>
      </div>
    </div>); })}</div>;
}

export function TodaysUpdates() {
  const { state } = useDueReminders();
  const rows: Array<[ReminderKind, string]> = [["beds", "Beds"], ["doctors", "Doctors"], ["medicine", "Medicine inventory"]];
  return <Card><CardHeader><CardTitle className="text-base">Today's Updates</CardTitle></CardHeader><CardContent className="space-y-3">{rows.map(([k, label]) => { const due = isDue(k, state); return (
    <div key={k} className="flex items-center gap-3 text-sm">
      {due ? <AlertTriangle className="size-4 text-warning" /> : <CheckCircle2 className="size-4 text-success" />}
      <span className="flex-1 font-semibold">{label}</span>
      <span className="text-xs text-muted-foreground">{k === "medicine" && !due ? `Next: ${nextMedicineUpdate(state).toLocaleDateString([], { day: "numeric", month: "short" })}` : due ? "Pending" : formatLast(lastOf(k, state))}</span>
    </div>); })}</CardContent></Card>;
}

const compliance: Array<[string, string, string, string]> = [["PHC Khordha", "ok", "warn", "ok"], ["Capital Hospital", "ok", "ok", "ok"], ["CHC Jatni", "late", "ok", "warn"], ["PHC Banki", "late", "late", "warn"], ["SCB Medical College", "ok", "ok", "ok"], ["District Hospital Puri", "ok", "ok", "ok"]];
const mark = (v: string) => v === "ok" ? <CheckCircle2 className="mx-auto size-4 text-success" aria-label="Up to date" /> : v === "warn" ? <Clock className="mx-auto size-4 text-warning" aria-label="Due soon" /> : <AlertTriangle className="mx-auto size-4 text-destructive" aria-label="Overdue" />;
export function ComplianceCard() {
  return <Card><CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base">Facility Update Compliance</CardTitle><DemoBadge /></CardHeader><CardContent>
    <table className="w-full text-sm"><thead><tr className="text-xs text-muted-foreground"><th className="py-2 text-left">Facility</th><th>Beds</th><th>Doctors</th><th>Medicine</th></tr></thead><tbody>{compliance.map((r) => <tr key={r[0]} className="border-t border-border"><td className="py-2 font-semibold">{r[0]}</td><td>{mark(r[1])}</td><td>{mark(r[2])}</td><td>{mark(r[3])}</td></tr>)}</tbody></table>
    <div className="mt-4 grid gap-3 sm:grid-cols-3">{[["Bed updates", 94], ["Doctor updates", 91], ["Medicine updates", 87]].map(([a, b]) => <div key={a}><div className="flex justify-between text-xs"><span className="text-muted-foreground">{a}</span><strong>{b}%</strong></div><Progress value={b as number} className="mt-1 h-1.5" /></div>)}</div>
  </CardContent></Card>;
}
