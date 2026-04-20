import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Interview Coach — Powered by Mesh API",
  description:
    "Test your developer skills with AI-powered mock interviews. Coach Mode or Roast Mode — your choice.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "AI Interview Coach — Powered by Mesh API",
    description: "How good are you really? Find out in the Hot Seat.",
    images: ["/favicon.svg"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="scanline min-h-screen flex flex-col">
        <div className="flex-1 pb-16">{children}</div>
        <footer className="fixed bottom-0 left-0 right-0 py-3 px-6 border-t border-white/10 bg-zinc-950/80 backdrop-blur-md flex flex-col items-center gap-1 text-center z-50">
          <a href="https://meshapi.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <img src="/favicon.svg" alt="" className="h-5 w-5" />
            <span className="font-mono text-sm font-medium text-zinc-300">mesh_api</span>
          </a>
          <p className="text-xs text-zinc-500 max-w-sm">One endpoint for GPT, Claude, Gemini, and 300+ LLMs. Switch providers in real-time. Pay in any currency.</p>
        </footer>
      </body>
    </html>
  );
}
