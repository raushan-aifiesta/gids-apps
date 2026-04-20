import Image from "next/image";
import { ContactFormPanel } from "./ContactFormPanel";

export function MobileContactDrawer() {
  return (
    <aside className="hidden lg:flex flex-col border-l border-border bg-card sticky top-0 h-screen overflow-y-auto">
      <div className="flex items-center gap-4 border-b border-border px-8 py-5 shrink-0">
        <Image
          src="/gids-qr.svg"
          alt="Scan to open GIDS"
          width={64}
          height={64}
          className="shrink-0"
        />
        <div>
          <p className="text-xs font-medium">Open on your phone</p>
          <p className="text-[11px] text-muted-foreground">Scan to explore GIDS</p>
        </div>
      </div>
      <div className="flex-1">
        <ContactFormPanel />
      </div>
    </aside>
  );
}
