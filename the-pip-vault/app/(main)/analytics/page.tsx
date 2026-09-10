import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AnalyticsClient from "./AnalyticsClient";
import { Trade } from "@/types/database";
import { cookies } from "next/headers";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 1. Read selection cookie
  const cookieStore = await cookies();
  const selectedAccountId = cookieStore.get("selected_account_id")?.value || "overall";

  // 2. Fetch trades for analytics calculations (filtered by account selection)
  let tradesQuery = supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id);

  if (selectedAccountId !== "overall") {
    tradesQuery = tradesQuery.eq("account_id", selectedAccountId);
  }

  const { data: trades, error } = await tradesQuery.order("date", { ascending: true }); // Oplopend voor de chart/streaks

  if (error) {
    console.error("Error fetching trades:", error.message);
  }

  const typedTrades = (trades || []) as Trade[];

  // Fetch user profile settings for sessions and strategies
  const { data: profile } = await supabase
    .from("profiles")
    .select("strategies, sessions")
    .eq("id", user.id)
    .maybeSingle();

  const userProfile = {
    strategies: profile?.strategies && profile.strategies.length > 0 
      ? profile.strategies 
      : ["Trend Continuation", "Reversal", "Breakout", "RSI Divergence"],
    sessions: profile?.sessions && profile.sessions.length > 0 
      ? profile.sessions 
      : ["London", "New York", "Tokyo", "Sydney"],
  };

  return <AnalyticsClient trades={typedTrades} userProfile={userProfile} />;
}