import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: "%s | Smart Scout In",
    default: "Smart Scout In — Plataforma de Scouting de Fútbol",
  },
  description:
    "Plataforma avanzada de scouting de fútbol: análisis de jugadores, vídeo táctico, comparativas y modelos de juego.",
  keywords: ["scouting", "fútbol", "análisis", "táctica", "jugadores"],
  authors: [{ name: "Smart Scout In" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`dark ${inter.variable}`}>
      <body className="font-sans antialiased bg-[#0a0f1e] text-slate-100">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
