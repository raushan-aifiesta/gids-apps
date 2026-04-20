import { LeftHeader } from "@/components/LeftHeader";
import { AppGrid } from "@/components/AppGrid";
import { Footer } from "@/components/Footer";
import { MobileContactDrawer } from "@/components/MobileContactDrawer";
import { StickyNavBar } from "@/components/StickyNavBar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1fr_420px]">
      {/* Left: scrollable content */}
      <main className="min-w-0">
        <StickyNavBar />
        <div className="mx-auto w-full max-w-[820px] px-6 pb-8 sm:px-10 sm:pb-12 lg:px-14 lg:py-16">
          <LeftHeader />
          <AppGrid />
        </div>
        <Footer />
      </main>

      {/* Right: contact panel — desktop sidebar only (mobile uses drawer in StickyNavBar) */}
      <MobileContactDrawer />
    </div>
  );
}
