import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flashcard Engine — Powered by Mesh API",
  description: "Turn any PDF into interactive flashcards with AI.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
        <footer className="fixed bottom-0 left-0 right-0 py-3 px-6 border-t border-white/8 bg-zinc-950/80 backdrop-blur-md flex flex-col items-center gap-1 text-center z-50">
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
