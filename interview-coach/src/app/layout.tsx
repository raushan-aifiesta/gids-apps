import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Interview Coach | Dev Summit",
  description:
    "Test your developer skills with AI-powered mock interviews. Coach Mode or Roast Mode — your choice.",
  openGraph: {
    title: "AI Interview Coach",
    description: "How good are you really? Find out in the Hot Seat.",
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
