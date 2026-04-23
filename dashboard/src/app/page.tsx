import { ArrowDown } from "lucide-react";
import { LeftHeader } from "@/components/LeftHeader";
import { AppGrid } from "@/components/AppGrid";
import { Footer } from "@/components/Footer";
import { MobileContactDrawer } from "@/components/MobileContactDrawer";
import { StickyNavBar } from "@/components/StickyNavBar";
import { ContactFormPanel } from "@/components/ContactFormPanel";

export default function DashboardPage() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1fr_420px]">
      {/* Left: scrollable content */}
      <main className="min-w-0">
        <StickyNavBar />

        {/* Mobile: contact form appears first so visitors hit it immediately.
            Desktop shows the form in the right sidebar instead (MobileContactDrawer). */}
        <section className="lg:hidden px-4 pt-4 pb-10">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <ContactFormPanel />
          </div>
          <div className="pt-8 flex justify-center">
            <a
              href="#apps"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              See all GIDS apps
              <ArrowDown size={16} />
            </a>
          </div>
        </section>

        <div
          id="apps"
          className="mx-auto w-full max-w-[820px] px-6 pb-8 sm:px-10 sm:pb-12 lg:px-14 lg:py-16 scroll-mt-16"
        >
          <LeftHeader />
          <AppGrid />
        </div>
        <Footer />
      </main>

      {/* Right: contact panel — desktop sidebar only */}
      <MobileContactDrawer />
    </div>
  );
}
