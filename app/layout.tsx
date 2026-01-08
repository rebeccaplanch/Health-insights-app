import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Health Tracker",
  description: "Personal health & performance tracker",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
