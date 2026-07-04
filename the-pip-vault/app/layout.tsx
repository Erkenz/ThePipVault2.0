import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "The Pip Vault | Premium Trading Journal",
  description: "Your professional trading command center.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider>


          {/* Hier renderen we puur de pagina of sub-layout */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}