import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "Mesh App Builder — Powered by Mesh API",
  description:
    "Describe an app, watch Mesh API build and run it live in a sandbox. Chat to iterate.",
};

// Client-side fetch shim: open-lovable's source has dozens of `fetch('/api/...')`
// calls. Next.js `basePath` doesn't auto-rewrite those, so without this shim the
// browser would GET `/api/...` (404) instead of `/apps/mesh-app-builder/api/...`.
// Runs inline before hydration so no race with the first client-side request.
const FETCH_SHIM = `(function(){
  if (typeof window === 'undefined' || window.__meshFetchPatched) return;
  var base = '/apps/mesh-app-builder';
  var orig = window.fetch.bind(window);
  window.fetch = function(input, init){
    if (typeof input === 'string' && input.startsWith('/api/')) {
      input = base + input;
    } else if (input && typeof input === 'object' && typeof input.url === 'string' && input.url.startsWith('/api/')) {
      input = new Request(base + input.url.replace(location.origin, ''), input);
    }
    return orig(input, init);
  };
  window.__meshFetchPatched = true;
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: FETCH_SHIM }} />
      </head>
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${robotoMono.variable} font-sans min-h-screen flex flex-col`}>
        <div className="flex-1 pb-24">{children}</div>
        <footer className="fixed bottom-0 left-0 right-0 py-3 px-6 border-t border-white/8 bg-black/85 backdrop-blur-md flex flex-col items-center gap-1 text-center z-50">
          <a
            href="https://meshapi.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <span className="font-mono text-sm font-medium text-white">mesh_api</span>
          </a>
          <p className="text-xs text-white/60 max-w-sm">
            One endpoint for GPT, Claude, Gemini, and 300+ LLMs. Switch providers in real-time. Pay in any currency.
          </p>
        </footer>
      </body>
    </html>
  );
}
