import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { Trade } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Haal alle trades op voor het dashboard, chronologisch gesorteerd
  const { data: trades, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching trades:", error.message);
  }

  const typedTrades = (trades || []) as Trade[];

  return <DashboardClient trades={typedTrades} />;
}