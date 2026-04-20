import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Multi-Model Chat — Powered by Mesh API",
  description: "Compare responses from multiple AI models side by side.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Multi-Model Chat — Powered by Mesh API",
    description: "Compare responses from multiple AI models side by side.",
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
      <body>
        <div className="min-h-screen flex flex-col">
          <QueryProvider>{children}</QueryProvider>
        </div>
      </body>
    </html>
  );
}
