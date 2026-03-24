'use client';

import { usePathname } from 'next/navigation';
import BottomTabBar from './BottomTabBar';

const HIDE_TAB_BAR = ['/login'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideTabBar = HIDE_TAB_BAR.includes(pathname);

  return (
    <>
      <div className={hideTabBar ? '' : 'mx-auto max-w-[640px]'}>
        {children}
      </div>
      {!hideTabBar && <BottomTabBar />}
    </>
  );
}
