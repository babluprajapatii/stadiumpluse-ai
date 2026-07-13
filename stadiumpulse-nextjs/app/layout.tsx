import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

import { AppProvider } from "@/providers/AppContext";
import { AuthProvider } from "@/providers/AuthProvider";

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
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <AuthProvider>
            <AppProvider>
              {children}
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
