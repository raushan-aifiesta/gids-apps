import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Interview Coach — Powered by Mesh API",
  description:
    "Test your developer skills with AI-powered mock interviews. Coach Mode or Roast Mode — your choice.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "AI Interview Coach — Powered by Mesh API",
    description: "How good are you really? Find out in the Hot Seat.",
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
      <body className="scanline">
        {children}
      </body>
    </html>
  );
}
