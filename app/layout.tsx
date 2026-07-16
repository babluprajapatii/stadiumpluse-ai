import type { Metadata, Viewport } from "next";
import { getSeoMetadata } from "@/lib/seo";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";

import { AppProvider } from "@/providers/AppContext";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = getSeoMetadata({
  title: "Intelligent Stadium Platform",
  description: "GenAI-powered crowd intelligence, incident response, and fan experience platform for smart stadiums during the FIFA World Cup 2026.",
  canonicalPath: "",
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

import { OrganizationSchema, WebSiteSchema, WebApplicationSchema } from "@/components/seo/JsonLd";

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
      <head>
        <script
          id="theme-initializer"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'system';
                  var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <AppProvider>
              <OrganizationSchema />
              <WebSiteSchema />
              <WebApplicationSchema />
              {children}
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
