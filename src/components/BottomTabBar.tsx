'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface TabCounts {
  pending: number;
  approved: number;
}

const tabs = [
  {
    href: '/',
    label: 'Pending',
    icon: (active: boolean) => (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    countKey: 'pending' as const,
  },
  {
    href: '/approved',
    label: 'Approved',
    icon: (active: boolean) => (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    countKey: 'approved' as const,
  },
  {
    href: '/more',
    label: 'More',
    icon: (active: boolean) => (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    countKey: null,
  },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<TabCounts>({ pending: 0, approved: 0 });

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(data => {
        setCounts({
          pending: data.leads?.pending || 0,
          approved: data.leads?.approved || 0,
        });
      })
      .catch(() => {});
  }, [pathname]);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[#0a0a0f]/95 backdrop-blur-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}>
      <div className="mx-auto max-w-[640px]">
        <div className="flex items-center justify-around h-[72px] px-2">
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            const count = tab.countKey ? counts[tab.countKey] : 0;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 w-16 py-1 transition-colors ${
                  active ? 'text-cyan-accent' : 'text-white/40'
                }`}
              >
                {active && (
                  <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-cyan-accent rounded-full" />
                )}
                <div className="relative">
                  {tab.icon(active)}
                  {tab.countKey && count > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-cyan-accent text-[10px] font-bold text-space-black px-1">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${active ? 'text-cyan-accent' : 'text-white/40'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      {/* Safe area for iOS */}
      <div className="h-safe-bottom bg-[#0a0a0f]/95" />
    </nav>
  );
}
