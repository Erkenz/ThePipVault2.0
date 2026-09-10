import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch user profile settings
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user profile settings:", error.message);
  }

  // Fallback default values if profile is null or columns are empty
  const initialProfile = {
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    currency: profile?.currency || "USD",
    starting_equity: profile?.starting_equity !== undefined && profile?.starting_equity !== null 
      ? Number(profile.starting_equity) 
      : 0,
    strategies: profile?.strategies && profile.strategies.length > 0 
      ? profile.strategies 
      : ["Trend Continuation", "Reversal", "Breakout", "RSI Divergence"],
    sessions: profile?.sessions && profile.sessions.length > 0 
      ? profile.sessions 
      : ["London", "New York", "Tokyo", "Sydney"],
    asset_class: profile?.asset_class || "forex",
  };

  return (
    <SettingsClient 
      initialProfile={initialProfile} 
      email={user.email || ""} 
    />
  );
}
