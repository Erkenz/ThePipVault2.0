import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 text-center">
      <div className="z-10 w-full max-w-3xl items-center justify-between">
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Welcome to <span className="text-blue-600 dark:text-blue-400">The Pip Vault</span>
        </h1>
        
        <p className="mx-auto mb-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Your professional trading journal. Track your trades, analyze your performance, 
          and master your psychology with precision.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link 
            href="/dashboard"
            className="rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Enter The Vault
          </Link>
        </div>
      </div>
    </main>
  );
}