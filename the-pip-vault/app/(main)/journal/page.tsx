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
  }

  const typedTrades = (trades || []) as Trade[];

  // 3. Fetch user profile settings for trade defaults
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

  // 4. Render client component with data
  return <JournalClient initialTrades={typedTrades} userProfile={userProfile} />;
}