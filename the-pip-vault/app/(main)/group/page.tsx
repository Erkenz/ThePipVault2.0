import { redirect } from 'next/navigation';

export default async function GroupPage() {
  // Beta 1.0: Group features are temporarily hidden and will return in a future update.
  redirect('/dashboard');
}
