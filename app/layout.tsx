import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Smart Scout In",
    default: "Smart Scout In — Plataforma de Scouting de Fútbol",
  },
  description:
    "Plataforma avanzada de scouting de fútbol: análisis de jugadores, vídeo táctico, comparativas y modelos de juego.",
  keywords: ["scouting", "fútbol", "análisis", "táctica", "jugadores"],
  authors: [{ name: "Smart Scout In" }],
  themeColor: "#16a34a",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("dark", "font-sans", geist.variable)}>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
