// API-ready medicine service. Currently backed by a local mock database (DEMO DATA).
export type MedicineRecord = { barcode: string; name: string; strength: string; unit: string };
export type InventoryEntry = { barcode?: string; medicineName: string; strength?: string; quantity: number; minimumThreshold: number; batchNumber?: string; expiryDate?: string; lastUpdated: string };

const MOCK_DB: MedicineRecord[] = [
  { barcode: "8901234567890", name: "Paracetamol", strength: "500mg", unit: "tablets" },
  { barcode: "8901234567891", name: "Amoxicillin", strength: "500mg", unit: "capsules" },
  { barcode: "8901234567892", name: "ORS", strength: "20.5g sachet", unit: "sachets" },
  { barcode: "8901234567893", name: "Insulin", strength: "100 IU/ml", unit: "vials" },
  { barcode: "8901234567894", name: "Oxytocin", strength: "5 IU/ml", unit: "ampoules" },
];

export async function getMedicineByBarcode(barcode: string): Promise<MedicineRecord | null> {
  return MOCK_DB.find((m) => m.barcode === barcode.trim()) ?? null;
}
export async function searchMedicine(name: string): Promise<MedicineRecord[]> {
  const q = name.trim().toLowerCase();
  return q ? MOCK_DB.filter((m) => m.name.toLowerCase().includes(q)) : [];
}
const KEY = "swasthya-inventory-entries";
export async function addMedicineToInventory(data: Omit<InventoryEntry, "lastUpdated">): Promise<InventoryEntry> {
  const entry = { ...data, lastUpdated: new Date().toISOString() };
  const all = listInventoryEntries(); localStorage.setItem(KEY, JSON.stringify([entry, ...all]));
  return entry;
}
export function listInventoryEntries(): InventoryEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
export function daysToExpiry(date?: string) {
  if (!date) return null; return Math.ceil((new Date(date).getTime() - Date.now()) / 864e5);
}
