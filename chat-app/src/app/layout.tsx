import type { Metadata } from "next";
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
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
