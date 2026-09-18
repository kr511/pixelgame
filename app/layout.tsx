import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Felice × Elias",
  description: "Eine kleine Welt nur für uns.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
