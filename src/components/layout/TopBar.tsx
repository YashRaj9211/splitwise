'use client';

import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import { useMobileNav } from '@/components/layout/MobileNavContext';

export function TopBar({ user }: { user?: any }) {
  const { toggle } = useMobileNav();
  const pathname = usePathname();

  // Simple helper to get title from path
  const getTitle = () => {
    const path = pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : '??';

  return (
    <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b-thick border-primary bg-surface px-8 lg:pl-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          className="md:hidden -ml-2 p-2 hover:bg-black/5 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6 text-primary" />
        </button>
        <h2 className="text-header text-2xl">{getTitle()}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full border-thick border-primary bg-accent-yellow flex items-center justify-center font-black text-sm text-primary overflow-hidden">
          {user?.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user?.name || 'User'} width={40} height={40} />
          ) : (
            initials
          )}
        </div>
      </div>
    </header>
  );
}
