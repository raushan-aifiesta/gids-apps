import Image from "next/image";
import { LeftHeader } from "@/components/LeftHeader";
import { AppGrid } from "@/components/AppGrid";
import { ContactFormPanel } from "@/components/ContactFormPanel";
import { Footer } from "@/components/Footer";

export default function DashboardPage() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1fr_420px]">
      {/* Left: scrollable content */}
      <main className="min-w-0">
        <div className="mx-auto w-full max-w-[820px] px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <LeftHeader />
          <AppGrid />
        </div>
        <Footer />
      </main>

      {/* Right: sticky full-height contact panel */}
      <aside className="flex flex-col border-t border-border bg-card lg:sticky lg:top-0 lg:h-screen lg:border-t-0 lg:border-l lg:overflow-y-auto">
        <div className="flex items-center gap-4 border-b border-border px-8 py-5">
          <Image src="/gids-qr.svg" alt="Scan to open GIDS" width={64} height={64} className="shrink-0" />
          <div>
            <p className="text-xs font-medium">Open on your phone</p>
            <p className="text-[11px] text-muted-foreground">Scan to explore GIDS</p>
          </div>
        </div>
        <div className="flex-1">
          <ContactFormPanel />
        </div>
      </aside>
    </div>
  );
}
