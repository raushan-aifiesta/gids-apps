import type { Metadata } from "next";
import type { ReactNode } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Builder — Powered by Mesh API",
  description:
    "Build a polished, ATS-optimized resume from your LinkedIn, GitHub, and uploaded documents.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Resume Builder — Powered by Mesh API",
    description:
      "Build a polished, ATS-optimized resume from your LinkedIn, GitHub, and uploaded documents.",
    images: ["/favicon.svg"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <QueryProvider>{children}</QueryProvider>
          <footer className="fixed bottom-0 left-0 right-0 py-3 px-6 border-t border-gray-100 bg-white/80 backdrop-blur-md flex flex-col items-center gap-1 text-center z-50">
            <a href="https://meshapi.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <img src="/favicon.svg" alt="" className="h-5 w-5" />
              <span className="font-mono text-sm font-medium text-gray-700">mesh_api</span>
            </a>
            <p className="text-xs text-gray-400 max-w-sm">One endpoint for GPT, Claude, Gemini, and 300+ LLMs. Switch providers in real-time. Pay in any currency.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
