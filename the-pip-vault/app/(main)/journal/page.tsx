import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import JournalClient from "./JournalClient";
import { Trade } from "@/types/database";

export default async function JournalPage() {
  const supabase = await createClient();

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Fetch trades based on the user
  const { data: trades, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching trades:", error.message);
    // In een volgende iteratie kunnen we hier error-boundaries of toast notifications server-side afvangen
  }

  const typedTrades = (trades || []) as Trade[];

  // 3. Render client component with data
  return <JournalClient initialTrades={typedTrades} />;
}