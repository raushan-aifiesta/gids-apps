import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Screener — Powered by Mesh API",
  description: "Screen resumes against job descriptions with AI-powered analysis.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Resume Screener — Powered by Mesh API",
    description: "Screen resumes against job descriptions with AI-powered analysis.",
    images: ["/favicon.svg"],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased font-sans text-slate-100 min-h-screen flex flex-col">
        <div className="flex-1 pb-16">{children}</div>
        <footer className="fixed bottom-0 left-0 right-0 py-3 px-6 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center gap-1 text-center z-50">
          <a href="https://meshapi.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <img src="/favicon.svg" alt="" className="h-5 w-5" />
            <span className="font-mono text-sm font-medium text-slate-300">mesh_api</span>
          </a>
          <p className="text-xs text-slate-500 max-w-sm">One endpoint for GPT, Claude, Gemini, and 300+ LLMs. Switch providers in real-time. Pay in any currency.</p>
        </footer>
      </body>
    </html>
  );
}
