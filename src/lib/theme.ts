import { useEffect, useState } from "react";
export type ThemePref = "light" | "dark" | "system";
const KEY = "swasthya-theme";
const listeners = new Set<(t: ThemePref) => void>();
export function getTheme(): ThemePref {
  if (typeof window === "undefined") return "system";
  const v = localStorage.getItem(KEY);
  return v === "light" || v === "dark" ? v : "system";
}
export function applyTheme(t: ThemePref) {
  const dark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}
export function setTheme(t: ThemePref) {
  localStorage.setItem(KEY, t);
  applyTheme(t);
  listeners.forEach((l) => l(t));
}
export function useTheme() {
  const [theme, set] = useState<ThemePref>("system");
  useEffect(() => {
    set(getTheme());
    listeners.add(set);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => getTheme() === "system" && applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => { listeners.delete(set); mq.removeEventListener("change", onChange); };
  }, []);
  return [theme, setTheme] as const;
}
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${KEY}');var d=t==='dark'||((!t||t==='system')&&matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark'}}catch(e){}})();`;
