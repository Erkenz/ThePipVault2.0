import { createClient } from '@/utils/supabase/server';

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { count: profilesCount, error: profilesError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: tradesCount, error: tradesError } = await supabase
    .from('trades')
    .select('*', { count: 'exact', head: true });

  const { count: groupsCount, error: groupsError } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true });

  const hasErrors = profilesError || tradesError || groupsError;

  return (
    <main className="p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Database Connection Status</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        {/* Profiles Table Card */}
        <div className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
          <h2 className="font-semibold text-lg mb-2">Profiles Table</h2>
          {profilesError ? (
            <p className="text-loss text-sm">Error: {profilesError.message}</p>
          ) : (
            <p className="text-profit text-sm font-medium">
              Connected (Rows: {profilesCount ?? 0})
            </p>
          )}
        </div>

        {/* Trades Table Card */}
        <div className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
          <h2 className="font-semibold text-lg mb-2">Trades Table</h2>
          {tradesError ? (
            <p className="text-loss text-sm">Error: {tradesError.message}</p>
          ) : (
            <p className="text-profit text-sm font-medium">
              Connected (Rows: {tradesCount ?? 0})
            </p>
          )}
        </div>

        {/* Groups Table Card */}
        <div className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
          <h2 className="font-semibold text-lg mb-2">Groups Table</h2>
          {groupsError ? (
            <p className="text-loss text-sm">Error: {groupsError.message}</p>
          ) : (
            <p className="text-profit text-sm font-medium">
              Connected (Rows: {groupsCount ?? 0})
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <p className="text-sm font-medium">
          Status: {hasErrors ? '❌ Er zijn verbindingsfouten aanwezig.' : '✅ Succesvol verbonden met alle bestaande tabellen!'}
        </p>
      </div>
    </main>
  );
}