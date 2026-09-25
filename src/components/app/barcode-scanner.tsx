import { useEffect, useRef, useState } from "react";
import { Camera, Keyboard, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BarcodeScanner({ open, onOpenChange, onDetected }: { open: boolean; onOpenChange: (o: boolean) => void; onDetected: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  useEffect(() => {
    if (!open) return;
    let stop: (() => void) | undefined; let cancelled = false; setError(null);
    (async () => {
      try {
        const [{ BrowserMultiFormatReader }, { DecodeHintType, BarcodeFormat }] = await Promise.all([import("@zxing/browser"), import("@zxing/library")]);
        const hints = new Map([[DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.CODE_128]]]);
        const reader = new BrowserMultiFormatReader(hints);
        await new Promise((r) => setTimeout(r, 50));
        if (cancelled || !videoRef.current) return;
        const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
          if (result) { controls.stop(); onDetected(result.getText()); onOpenChange(false); }
        });
        stop = () => controls.stop();
      } catch {
        setError("Camera unavailable or permission denied. Enter the barcode number below instead.");
      }
    })();
    return () => { cancelled = true; stop?.(); };
  }, [open, onDetected, onOpenChange]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ScanLine className="size-5 text-primary" />Scan medicine barcode</DialogTitle>
          <DialogDescription>Point the camera at the package barcode (EAN-13, EAN-8, UPC-A, Code 128).</DialogDescription>
        </DialogHeader>
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-ink">
          <video ref={videoRef} className="size-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 bg-destructive/80" />
          {error && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted p-4 text-center text-sm text-muted-foreground"><Camera className="size-6" />{error}</div>}
        </div>
        <div>
          <Label htmlFor="manual-barcode" className="flex items-center gap-2"><Keyboard className="size-4" />Or type barcode number</Label>
          <div className="mt-2 flex gap-2">
            <Input id="manual-barcode" inputMode="numeric" placeholder="e.g. 8901234567890" value={manual} onChange={(e) => setManual(e.target.value)} />
            <Button onClick={() => { if (manual.trim()) { onDetected(manual.trim()); setManual(""); onOpenChange(false); } }}>Look up</Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Demo barcodes: 8901234567890 – 8901234567894</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
