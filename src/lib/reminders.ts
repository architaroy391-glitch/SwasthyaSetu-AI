import { useEffect, useState } from "react";

export type MedicineFrequency = 7 | 10;
export type ReminderState = {
  lastBedUpdate: string | null;
  lastDoctorUpdate: string | null;
  lastMedicineUpdate: string | null;
  medicineUpdateFrequency: MedicineFrequency;
  snoozedUntil: Partial<Record<ReminderKind, string>>;
  updatedBy: Partial<Record<ReminderKind, string>>;
};
export type ReminderKind = "beds" | "doctors" | "medicine";

const KEY = "swasthya-reminders";
const EVT = "swasthya-reminders-change";
const defaults: ReminderState = {
  lastBedUpdate: null,
  lastDoctorUpdate: null,
  lastMedicineUpdate: new Date(Date.now() - 8 * 864e5).toISOString(),
  medicineUpdateFrequency: 7,
  snoozedUntil: {},
  updatedBy: {},
};

export function readReminders(): ReminderState {
  if (typeof window === "undefined") return defaults;
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") }; } catch { return defaults; }
}
function write(s: ReminderState) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(EVT));
}
export function markUpdated(kind: ReminderKind, user = "Facility staff") {
  const s = readReminders(); const now = new Date().toISOString();
  if (kind === "beds") s.lastBedUpdate = now;
  if (kind === "doctors") s.lastDoctorUpdate = now;
  if (kind === "medicine") s.lastMedicineUpdate = now;
  s.updatedBy = { ...s.updatedBy, [kind]: user };
  delete s.snoozedUntil[kind];
  write(s);
}
export function snooze(kind: ReminderKind, hours = 2) {
  const s = readReminders();
  s.snoozedUntil = { ...s.snoozedUntil, [kind]: new Date(Date.now() + hours * 36e5).toISOString() };
  write(s);
}
export function setMedicineFrequency(f: MedicineFrequency) { write({ ...readReminders(), medicineUpdateFrequency: f }); }

const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
export function nextMedicineUpdate(s: ReminderState) {
  const base = s.lastMedicineUpdate ? new Date(s.lastMedicineUpdate) : new Date(0);
  return new Date(dayStart(base) + s.medicineUpdateFrequency * 864e5);
}
export function isDue(kind: ReminderKind, s: ReminderState, now = new Date()) {
  if (kind === "medicine") return now.getTime() >= nextMedicineUpdate(s).getTime();
  const last = kind === "beds" ? s.lastBedUpdate : s.lastDoctorUpdate;
  return !last || dayStart(now) > dayStart(new Date(last));
}
export function isSnoozed(kind: ReminderKind, s: ReminderState) {
  const u = s.snoozedUntil[kind]; return !!u && new Date(u).getTime() > Date.now();
}
export function lastOf(kind: ReminderKind, s: ReminderState) {
  return kind === "beds" ? s.lastBedUpdate : kind === "doctors" ? s.lastDoctorUpdate : s.lastMedicineUpdate;
}
export function formatLast(iso: string | null) {
  if (!iso) return "Never";
  const d = new Date(iso); const t = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (dayStart(d) === dayStart(new Date())) return `Today, ${t}`;
  return `${d.toLocaleDateString([], { day: "numeric", month: "short" })}, ${t}`;
}

export function useReminders() {
  const [s, setS] = useState<ReminderState>(defaults);
  useEffect(() => {
    const r = () => setS(readReminders()); r();
    window.addEventListener(EVT, r); window.addEventListener("storage", r);
    return () => { window.removeEventListener(EVT, r); window.removeEventListener("storage", r); };
  }, []);
  return s;
}

export const reminderMeta: Record<ReminderKind, { title: string; message: string; to: "/resources" | "/inventory"; cta: string }> = {
  beds: { title: "Daily Bed Availability Update", message: "Please update today's available beds for your facility.", to: "/resources", cta: "Update Now" },
  doctors: { title: "Daily Doctor Availability Update", message: "Please confirm today's doctor and specialist availability.", to: "/resources", cta: "Update Now" },
  medicine: { title: "Medicine Inventory Update Required", message: "Your scheduled medicine stock update is due. Please review and update inventory.", to: "/inventory", cta: "Update Inventory" },
};
