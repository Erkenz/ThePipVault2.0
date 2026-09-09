import { redirect } from 'next/navigation';

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  const code = params.code ? encodeURIComponent(params.code) : '';
  
  // Beta 1.0: Group page is hidden for everyone
  redirect('/dashboard');
}
