import { Sidebar } from "@/components/layout/Sidebar";

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 transition-[margin] duration-300 ml-[72px] md:ml-[260px] min-w-0 flex flex-col">
        {children}
      </main>
    </div>
  );
}