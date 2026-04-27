import { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { siteConfig } from "@/config/site";
import "./globals.css";
import { SystemSettingsProvider } from "@/lib/system-settings-context";
import { AudioProvider } from "@/lib/music/audio-context";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: "Personal website of James McFadden",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: siteConfig.title,
    siteName: siteConfig.title,
    url: siteConfig.url,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, interactive-widget=resizes-content"
        />
      </head>
      <body className="h-dvh">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SystemSettingsProvider>
            <AudioProvider>
              {children}
            </AudioProvider>
          </SystemSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
