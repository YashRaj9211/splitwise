import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MobileNavProvider } from '@/components/layout/MobileNavContext';
import { redirect } from 'next/navigation';
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login')
  }
  return (
    <MobileNavProvider>
      <div className="min-h-screen bg-primary-light">
        <Sidebar />
        <div className="md:pl-64 flex flex-col min-h-screen">
          <TopBar user={session?.user} />
          <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
