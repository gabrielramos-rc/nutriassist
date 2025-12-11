import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NutriAssist - Assistente Virtual para Nutricionistas",
  description:
    "Automatize agendamentos e responda dúvidas dos pacientes 24/7 com a Nina, sua assistente de IA especializada em nutrição.",
  keywords: ["nutricionista", "agendamento", "IA", "chatbot", "nutrição"],
  authors: [{ name: "NutriAssist" }],
  openGraph: {
    title: "NutriAssist - Assistente Virtual para Nutricionistas",
    description:
      "Automatize agendamentos e responda dúvidas dos pacientes 24/7 com a Nina.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
