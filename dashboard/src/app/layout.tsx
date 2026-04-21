import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apps you can build with Mesh API",
  description:
    "Real apps powered by Mesh API — one OpenAI-compatible endpoint for every AI model.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Apps you can build with Mesh API",
    description:
      "Real apps powered by Mesh API — one OpenAI-compatible endpoint for every AI model.",
    images: ["/mesh_api_logo_main_dark_theme.svg"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
