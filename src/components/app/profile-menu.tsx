import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Monitor, Moon, Pencil, Settings, Sun, User } from "lucide-react";
import { useAccount } from "@/hooks/use-account";
import { useTheme } from "@/lib/theme";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VerifiedTick } from "./access";

export function UserAvatar({ className = "size-9" }: { className?: string }) {
  const { data } = useAccount();
  return (
    <Avatar className={className}>
      {data?.avatarSrc && <AvatarImage src={data.avatarSrc} alt="Profile picture" className="object-cover" />}
      <AvatarFallback className="bg-primary-soft font-bold text-primary">{data?.initials ?? "…"}</AvatarFallback>
    </Avatar>
  );
}

export function roleLabel(role?: string, verified?: boolean, status?: string) {
  if (role === "admin") return "Administrator";
  if (role === "hospital_staff") return verified ? "✓ Verified Hospital Staff" : status === "rejected" ? "Verification rejected" : "Hospital Staff · verification pending";
  return "Normal User";
}

export function ProfileMenu() {
  const { data } = useAccount();
  const [theme, setTheme] = useTheme();
  const nav = useNavigate();
  const qc = useQueryClient();
  async function logout() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/login", replace: true });
  }
  const p = data?.profile;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-1 rounded-full px-1" aria-label="Open profile menu">
          <UserAvatar />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-3 font-normal">
          <UserAvatar className="size-11" />
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate font-bold">{p?.full_name || data?.email}{data?.isVerifiedStaff && <VerifiedTick />}</p>
            <p className="truncate text-xs text-muted-foreground">{roleLabel(data?.role, data?.isVerifiedStaff, p?.verification_status)}</p>
            {data?.role === "hospital_staff" && p?.hospital_name && <p className="truncate text-xs text-muted-foreground">{p.hospital_name}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link to="/profile" search={{ edit: false }}><User />View Profile</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/profile" search={{ edit: true }}><Pencil />Update Profile</Link></DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger><Moon className="mr-2 size-4" />Dark Mode</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
              <DropdownMenuRadioItem value="light"><Sun className="mr-2 size-4" />Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark"><Moon className="mr-2 size-4" />Dark</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system"><Monitor className="mr-2 size-4" />System</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem asChild><Link to="/settings"><Settings />Settings</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}><LogOut />Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppearanceToggle() {
  const [theme, setTheme] = useTheme();
  const opts = [["light", Sun, "Light"], ["dark", Moon, "Dark"], ["system", Monitor, "System"]] as const;
  return (
    <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-3 gap-2">
      {opts.map(([v, Icon, label]) => (
        <Button key={v} type="button" role="radio" aria-checked={theme === v} variant={theme === v ? "default" : "outline"} onClick={() => setTheme(v)} className="gap-2">
          <Icon className="size-4" />{label}
        </Button>
      ))}
    </div>
  );
}
