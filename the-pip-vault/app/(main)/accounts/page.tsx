import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AccountsClient from "./AccountsClient";

export default async function AccountsPage() {
  const supabase = await createClient();

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Fetch accounts list for the user
  const { data: accounts, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching accounts:", error.message);
  }

  const initialAccounts = accounts || [];

  return (
    <AccountsClient 
      initialAccounts={initialAccounts} 
    />
  );
}
