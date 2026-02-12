'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Car,
  Package,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  Zap,
  ChevronLeft,
  BarChart3
} from 'lucide-react';
import clsx from 'clsx';
import { logoutAction } from '@/app/actions/auth';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Job Board', href: '/dashboard/jobs', icon: ClipboardList },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar({ user }: { user?: any }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) setIsCollapsed(JSON.parse(saved));
  }, []);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(nextState));
  };

  return (
    <aside className={clsx('sidebar flex', { 'collapsed': isCollapsed })}>
      <div className="sidebar-header">
        <div className="logo">
          <Car className="text-primary-600" size={28} />
          <span>GaragePro</span>
        </div>
        <button className="collapse-btn" onClick={toggleSidebar}>
          <ChevronLeft size={16} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          // RBAC: Inventory and Reports are admin-only
          if ((item.name === 'Inventory' || item.name === 'Reports') && user?.role !== 'admin') return null;

          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx('sidebar-item', { 'active': isActive })}
              title={isCollapsed ? item.name : ''}
              suppressHydrationWarning
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
  );
}
