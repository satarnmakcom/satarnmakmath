import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/AppLayout";
import NextAuthProvider from "@/components/NextAuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SatarnMath — Global Competitive Mathematics",
  description: "A world-class platform for competitive mathematics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}
      >
        <NextAuthProvider>
          <AppLayout>{children}</AppLayout>
        </NextAuthProvider>
      </body>
    </html>
  );
}
