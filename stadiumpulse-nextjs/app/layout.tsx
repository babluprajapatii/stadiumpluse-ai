import type { Metadata } from "next";
import { Outfit, DM_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

import { AppProvider } from "@/providers/AppContext";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "StadiumPulse AI · Intelligent Stadium Platform",
  description: "GenAI-powered operations for FIFA World Cup 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${dmMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <AppProvider>
            {children}
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
