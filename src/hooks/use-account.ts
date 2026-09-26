import { useQuery, useQueryClient } from "@tanstack/react-query";
import { openDB } from "idb";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type AccountRole = "admin" | "hospital_staff" | "normal_user";
export type Account = {
  userId: string;
  email: string;
  profile: Profile;
  role: AccountRole;
  isAdmin: boolean;
  isVerifiedStaff: boolean;
  canManageHospital: boolean;
  avatarSrc: string | null;
  initials: string;
};

const pendingDb = () => openDB("swasthya-pending", 1, { upgrade: (db) => db.createObjectStore("files") });
export async function savePendingIdCard(file: File) {
  const db = await pendingDb();
  await db.put("files", file, "id-card");
}
async function takePendingIdCard(): Promise<File | undefined> {
  const db = await pendingDb();
  const f = (await db.get("files", "id-card")) as File | undefined;
  return f;
}
async function clearPendingIdCard() {
  const db = await pendingDb();
  await db.delete("files", "id-card");
}

export async function uploadIdCard(userId: string, file: File) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/id-card-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("id-cards").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}

export function initialsOf(name: string, email = "") {
  const src = name.trim() || email.split("@")[0] || "U";
  const parts = src.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || src.slice(0, 2).toUpperCase();
}

async function loadAccount(): Promise<Account | null> {
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;
  if (!user) return null;
  let { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) {
    const m = (user.user_metadata ?? {}) as Record<string, string | undefined>;
    const staff = m.account_type === "hospital_staff";
    const { data: created, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        full_name: m.full_name ?? m.name ?? "",
        phone: m.phone ?? null,
        account_type: staff ? "hospital_staff" : "normal_user",
        hospital_name: staff ? m.hospital_name ?? null : null,
        hospital_id: staff ? m.hospital_id ?? null : null,
        hospital_state: staff ? m.hospital_state ?? null : null,
        hospital_district: staff ? m.hospital_district ?? null : null,
      })
      .select("*")
      .single();
    if (error) throw error;
    profile = created;
  }
  if (profile.account_type === "hospital_staff" && !profile.id_card_path) {
    const f = await takePendingIdCard().catch(() => undefined);
    if (f) {
      try {
        const path = await uploadIdCard(user.id, f);
        const { data: upd } = await supabase.from("profiles").update({ id_card_path: path }).eq("id", user.id).select("*").single();
        if (upd) profile = upd;
        await clearPendingIdCard();
      } catch { /* retry next load */ }
    }
  }
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const isAdmin = (roles ?? []).some((r) => r.role === "DISTRICT_ADMIN" || r.role === "SUPER_ADMIN");
  let avatarSrc: string | null = null;
  if (profile.avatar_url) {
    const { data } = await supabase.storage.from("avatars").createSignedUrl(profile.avatar_url, 3600);
    avatarSrc = data?.signedUrl ?? null;
  }
  const isVerifiedStaff = profile.account_type === "hospital_staff" && profile.verification_status === "verified";
  return {
    userId: user.id,
    email: user.email ?? "",
    profile,
    role: isAdmin ? "admin" : (profile.account_type as AccountRole),
    isAdmin,
    isVerifiedStaff,
    canManageHospital: isAdmin || isVerifiedStaff,
    avatarSrc,
    initials: initialsOf(profile.full_name, user.email ?? ""),
  };
}

export function useAccount() {
  return useQuery({ queryKey: ["account"], queryFn: loadAccount, staleTime: 60_000 });
}
export function useRefreshAccount() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["account"] });
}
