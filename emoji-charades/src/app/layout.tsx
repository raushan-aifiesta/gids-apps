import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Emoji Charades — Powered by Mesh API",
  description:
    "AI picks a movie, song, or book and emojifies it. You get 3 tries to guess.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <div className="flex-1 pb-24">{children}</div>
        <footer className="fixed bottom-0 left-0 right-0 py-3 px-6 border-t border-white/8 bg-[color:var(--background)]/85 backdrop-blur-md flex flex-col items-center gap-1 text-center z-50">
          <a
            href="https://meshapi.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <img src="/favicon.svg" alt="" className="h-5 w-5" />
            <span className="font-mono text-sm font-medium text-[color:var(--foreground)]">
              mesh_api
            </span>
          </a>
          <p className="text-xs text-[color:var(--muted-fg)] max-w-sm">
            One endpoint for GPT, Claude, Gemini, and 300+ LLMs. Switch providers in
            real-time. Pay in any currency.
          </p>
        </footer>
      </body>
    </html>
  );
}
