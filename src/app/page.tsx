import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-black text-primary">Splitwise Clone</h1>
        <p className="text-xl text-gray-500">Track shared expenses with friends and family.</p>
        <Link href="/auth/login">
          <Button size="lg">Sign In to Continue</Button>
        </Link>
      </div>
    </div>
  );
}
