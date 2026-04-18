import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ContactGateProvider } from "@/lib/contactGate";

export const metadata: Metadata = {
  title: "Multi-Model Chat — Powered by Mesh API",
  description: "Compare responses from multiple AI models side by side.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <ContactGateProvider>{children}</ContactGateProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
