import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { Trade } from "@/types/database";

import { cookies } from "next/headers";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 1. Read selection cookie
  const cookieStore = await cookies();
  const selectedAccountId = cookieStore.get("selected_account_id")?.value || "overall";

  // 2. Fetch user's accounts list
  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  // 3. Haal trades op gefilterd per geselecteerd account
  let tradesQuery = supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id);

  if (selectedAccountId !== "overall") {
    tradesQuery = tradesQuery.eq("account_id", selectedAccountId);
  }

  const { data: trades, error } = await tradesQuery.order("date", { ascending: true });

  if (error) {
    console.error("Error fetching trades:", error.message);
  }

  const typedTrades = (trades || []) as Trade[];

  // Fetch user profile settings for trade defaults
  const { data: profile } = await supabase
    .from("profiles")
    .select("asset_class, strategies, sessions")
    .eq("id", user.id)
    .maybeSingle();

  const userProfile = {
    default_asset_type: profile?.asset_class || "forex",
    strategies: profile?.strategies && profile.strategies.length > 0 
      ? profile.strategies 
      : ["Trend Continuation", "Reversal", "Breakout", "RSI Divergence"],
    sessions: profile?.sessions && profile.sessions.length > 0 
      ? profile.sessions 
      : ["London", "New York", "Tokyo", "Sydney"],
  };

  return <DashboardClient trades={typedTrades} userProfile={userProfile} accounts={accounts || []} />;
}