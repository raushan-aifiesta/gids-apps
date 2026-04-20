import type { Metadata } from "next";
import type { ReactNode } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guess My Salary — Powered by Mesh API",
  description:
    "Upload your resume and find out what you're worth in the Indian job market.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Guess My Salary — Powered by Mesh API",
    description:
      "Upload your resume and find out what you're worth in the Indian job market.",
    images: ["/favicon.svg"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
