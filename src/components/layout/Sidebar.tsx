'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, Users, User, Activity, LogOut, X } from 'lucide-react';
import { singoutFn } from '@/actions/auth';
import { useMobileNav } from '@/components/layout/MobileNavContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Groups', href: '/groups', icon: Users },
  { name: 'Friends', href: '/friends', icon: User },
  { name: 'Activity', href: '/activity', icon: Activity }
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useMobileNav();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={close} />}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 border-r-thick border-primary bg-primary-light flex flex-col
          transition-transform duration-300 ease-in-out md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-20 items-center justify-between border-b-thick border-primary bg-primary px-6">
          <h1 className="text-2xl font-black tracking-tight text-white">SPLITWISE</h1>
          <button onClick={close} className="md:hidden text-white hover:text-white/80 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          {navigation.map(item => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all
                  ${
                    isActive
                      ? 'bg-primary text-white shadow-[2px_2px_0px_rgba(0,0,0,0.2)]'
                      : 'text-primary hover:bg-white hover:shadow-[2px_2px_0px_var(--color-primary)] border-2 border-transparent hover:border-primary'
                  }
                `}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-primary'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t-thick border-primary">
          {/* Placeholder for optional footer or logout */}
          <form action={singoutFn}>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-primary hover:bg-red-50 hover:text-red-600 transition-colors hover:cursor-pointer">
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
