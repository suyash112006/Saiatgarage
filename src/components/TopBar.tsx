'use client';

import React, { useEffect, useState } from 'react';
import { Search, Bell, Moon, Sun } from 'lucide-react';
import { updateUserTheme } from '@/app/actions/user';

export default function TopBar({ user }: { user: any }) {
  const [theme, setTheme] = useState(user?.theme || 'light');

  // Load persistence and handle initial set
  useEffect(() => {
    // Priority: user.theme > localStorage > fallback
    const saved = localStorage.getItem('theme');
    const initialTheme = user?.theme || saved || 'light';

    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    if (!saved) {
      localStorage.setItem('theme', initialTheme);
    }
  }, [user?.theme]);

  const toggleTheme = async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);

    if (user?.id) {
      await updateUserTheme(user.id, nextTheme);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
      </div>

      <div className="topbar-right">
        <button className="icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button className="icon-btn">
          <Bell size={18} />
          <span className="notif-badge">3</span>
        </button>

        <div className="profile">
          <div className="avatar">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="profile-text">
            <div className="profile-name">{user?.name || 'User'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
