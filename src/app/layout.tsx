import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/AppLayout";
import NextAuthProvider from "@/components/NextAuthProvider";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | SatarnMath",
    default: "SatarnMath — Global Competitive Mathematics",
  },
  description: "A world-class platform for learning competitive mathematics, olympiad training, and tracking your progress.",
  keywords: ["math", "olympiad", "competitive programming", "POSN", "IMO", "education"],
  authors: [{ name: "Satarnmak" }],
  openGraph: {
    title: "SatarnMath — Global Competitive Mathematics",
    description: "A world-class platform for learning competitive mathematics.",
    url: "https://satarnmath.com",
    siteName: "SatarnMath",
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SatarnMath",
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
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-primary text-primary overflow-x-hidden`}
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
