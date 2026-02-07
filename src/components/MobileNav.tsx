'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    Package,
    Settings,
    MoreHorizontal
} from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Jobs', href: '/dashboard/jobs', icon: ClipboardList },
    { name: 'Clients', href: '/dashboard/customers', icon: Users },
    { name: 'Stock', href: '/dashboard/inventory', icon: Package },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function MobileNav({ user }: { user?: any }) {
    const pathname = usePathname();

    // Filter items based on role
    const visibleItems = navItems.filter(item => {
        if (item.name === 'Stock' && user?.role !== 'admin') return false;
        return true;
    });

    // If too many items, we might need a "More" menu, but for now 5 fits.
    // We'll stick to max 5 items for bottom nav standard.

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden pb-safe-area">
            <nav className="flex justify-around items-center h-16">
                {visibleItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                'flex flex-col items-center justify-center w-full h-full space-y-1',
                                isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
                            )}
                        >
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
