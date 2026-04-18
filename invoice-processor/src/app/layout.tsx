import type { Metadata } from "next";
import type { ReactNode } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { ContactGateProvider } from "@/lib/contactGate";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invoice Processor — Powered by Mesh API",
  description:
    "Upload an invoice PDF, extract structured fields with Mesh, classify the expense, and export a downloadable summary PDF.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
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
