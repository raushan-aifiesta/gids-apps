import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Will AI Take My Job? — Powered by Mesh API",
  description:
    "Find out your job's automation risk score and get a personalized upskilling roadmap.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Will AI Take My Job? — Powered by Mesh API",
    description:
      "Find out your job's automation risk score and get a personalized upskilling roadmap.",
    images: ["/favicon.svg"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-16">
        <ThemeProvider>{children}</ThemeProvider>
        <footer className="fixed bottom-0 left-0 right-0 py-3 px-6 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md flex flex-col items-center gap-1 text-center z-50">
          <a href="https://meshapi.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <img src="/favicon.svg" alt="" className="h-5 w-5" />
            <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">mesh_api</span>
          </a>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">One endpoint for GPT, Claude, Gemini, and 300+ LLMs. Switch providers in real-time. Pay in any currency.</p>
        </footer>
      </body>
    </html>
  );
}
