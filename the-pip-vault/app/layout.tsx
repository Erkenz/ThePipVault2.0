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
          {/* De kosmische gloed mag wel overal blijven */}
          <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
            <div className="absolute -top-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]" />
            <div className="absolute -bottom-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-violet-500/6 blur-[120px]" />
          </div>

          {/* Hier renderen we puur de pagina of sub-layout */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}