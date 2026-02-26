import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Insurance Claims",
  description: "AI-powered car damage assessment for insurance claims",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
