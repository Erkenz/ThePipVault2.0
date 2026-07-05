import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Fetch accounts list for the user
  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  // 3. Read selection cookie
  const cookieStore = await cookies();
  const selectedAccountId = cookieStore.get("selected_account_id")?.value || "overall";

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar 
        initialAccounts={accounts || []} 
        selectedAccountId={selectedAccountId} 
      />
      <main className="flex-1 transition-[margin] duration-300 ml-[64px] md:ml-[240px] min-w-0 flex flex-col">
        {children}
      </main>
    </div>
  );
}