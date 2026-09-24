import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
export function StatusBadge({status}:{status:string}){const s=status.toLowerCase();return <Badge variant="outline" className={cn("gap-1.5 capitalize",s==="healthy"||s==="low"||s==="responded"?"border-success/30 bg-success-soft text-success":s==="warning"||s==="high"||s==="pending"?"border-warning/30 bg-warning-soft text-warning-foreground":s==="critical"||s==="unavailable"?"border-destructive/30 bg-destructive-soft text-destructive":"border-border bg-muted text-muted-foreground")}><span className="size-1.5 rounded-full bg-current"/>{status}</Badge>}
export function DemoBadge(){return <Badge className="border-demo/25 bg-demo-soft text-demo shadow-none hover:bg-demo-soft">Demo data</Badge>}
