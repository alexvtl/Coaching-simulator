import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Coaching Simulator | AI Voice Training",
  description: "Entraînez-vous à des conversations difficiles avec une IA vocale ultra-réaliste. Propulsé par OpenAI Realtime API.",
  keywords: ["coaching", "AI", "voice", "training", "simulation", "OpenAI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
