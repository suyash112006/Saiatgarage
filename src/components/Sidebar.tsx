'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Car,
  Layers,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  Zap,
  ChevronLeft,
  BarChart3,
  Trash2,
  Menu
} from 'lucide-react';
import clsx from 'clsx';
import { logoutAction } from '@/app/actions/auth';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Job Board', href: '/dashboard/jobs', icon: ClipboardList },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Layers },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Trash', href: '/dashboard/trash', icon: Trash2 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar({ user }: { user?: any }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });
  const pathname = usePathname();

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(nextState));
  };

  return (
    <>
      <div 
        className={clsx('mobile-overlay md:hidden')} 
        onClick={() => document.body.classList.remove('mobile-nav-open')}
      />
      <aside className={clsx('sidebar flex', { 'collapsed': isCollapsed })}>
        <div className="sidebar-header">
          <div className="logo">
            <Car className="text-primary-600" size={28} />
            <span>GaragePro</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="collapse-btn hidden md:flex" onClick={toggleSidebar}>
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            // RBAC: Inventory, Reports, and Trash are admin-only
            if ((item.name === 'Inventory' || item.name === 'Reports' || item.name === 'Trash') && user?.role !== 'admin') return null;

            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx('sidebar-item', { 'active': isActive })}
                title={isCollapsed ? item.name : ''}
                suppressHydrationWarning
                onClick={() => {
                  if (window.innerWidth <= 768) {
                    document.body.classList.remove('mobile-nav-open');
                  }
                }}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <form action={logoutAction}>
            <button type="submit" className="logout-pill">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
