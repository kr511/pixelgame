import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Felice × Elias",
  description: "Felices begehbares 2D-Pixelzimmer.",
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
