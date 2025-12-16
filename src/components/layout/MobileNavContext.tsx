'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type MobileNavContextType = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
};

const MobileNavContext = createContext<MobileNavContextType | undefined>(undefined);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggle = () => setIsOpen(prev => !prev);
  const close = () => setIsOpen(false);

  // Close sidebar on route change
  useEffect(() => {
    close();
  }, [pathname]);

  return <MobileNavContext.Provider value={{ isOpen, toggle, close }}>{children}</MobileNavContext.Provider>;
}

export function useMobileNav() {
  const context = useContext(MobileNavContext);
  if (context === undefined) {
    throw new Error('useMobileNav must be used within a MobileNavProvider');
  }
  return context;
}
