// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/app/components/providers/theme-provider";
import { Sidebar } from "@/app/components/layout/Sidebar";

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
          {/* 
            Subtiele kosmische gloed op de achtergrond.
            Pointer-events-none zorgt dat het niet in de weg zit bij klikken.
          */}
          <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
            <div className="absolute -top-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]" />
            <div className="absolute -bottom-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-violet-500/6 blur-[120px]" />
          </div>

          <div className="flex min-h-screen w-full">
            <Sidebar />
            
            {/* 
              Content area. Marge schuift mee met de sidebar.
              (md:ml-[72px] of md:ml-[260px] afhankelijk van de breedte, 
               maar omdat we het dynamisch willen maken in CSS/JS gebruiken we peer of padding. 
               Voor nu: flex-1 met een linker padding voor veilige weergave).
            */}
            <main className="flex-1 transition-[margin] duration-300 ml-[72px] md:ml-[260px] min-w-0 flex flex-col">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}