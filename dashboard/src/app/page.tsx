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
      <aside className="border-t border-border bg-card lg:sticky lg:top-0 lg:h-screen lg:border-t-0 lg:border-l lg:overflow-y-auto">
        <ContactFormPanel />
      </aside>
    </div>
  );
}
