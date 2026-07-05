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

  return <DashboardClient trades={typedTrades} userProfile={userProfile} />;
}