import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Outfit, Kanit } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import AppLayout from "@/components/AppLayout";
import NextAuthProvider from "@/components/NextAuthProvider";
import { Toaster } from "sonner";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const kanit = Kanit({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Satarnmak Math",
    default: "Satarnmak Math — Global Competitive Mathematics",
  },
  description: "A world-class platform for learning competitive mathematics, olympiad training, and tracking your progress.",
  keywords: ["math", "olympiad", "competitive programming", "POSN", "IMO", "education"],
  authors: [{ name: "Satarnmak" }],
  openGraph: {
    title: "Satarnmak Math — Global Competitive Mathematics",
    description: "A world-class platform for learning competitive mathematics.",
    url: "https://satarnmath.com",
    siteName: "Satarnmak Math",
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Satarnmak Math",
    description: "Global Competitive Mathematics Platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
        <Script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" strategy="afterInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" strategy="afterInteractive" />
      </head>
      <body
        className={`${inter.variable} ${kanit.variable} ${outfit.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-primary text-primary overflow-x-hidden`}
      >
        <div className="noise-overlay pointer-events-none fixed inset-0 z-[-1] opacity-20 mix-blend-overlay"></div>
        <NextAuthProvider>
          <AppLayout>{children}</AppLayout>
        </NextAuthProvider>
        <Toaster position="bottom-right" theme="dark" richColors closeButton />
      </body>
    </html>
  );
}
