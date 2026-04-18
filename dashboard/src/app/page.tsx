import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { ContactFormPanel } from "@/components/ContactFormPanel";
import { AppGrid } from "@/components/AppGrid";
import { Footer } from "@/components/Footer";

export default function DashboardPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero right={<ContactFormPanel />} />
        <AppGrid />
      </main>
      <Footer />
    </>
  );
}
