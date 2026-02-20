'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Bell, Moon, Sun, Check, X, Clock, FileText, User, Car, ChevronRight } from 'lucide-react';
import { updateUserTheme } from '@/app/actions/user';
import { getUnreadNotifications, markNotificationRead, markAllNotificationsRead } from '@/app/actions/notification';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import BackButton from './BackButton';
import NotificationModal from './NotificationModal';

export default function TopBar({ user }: { user: any }) {
  console.log('TopBar rendered', { user });
  const [theme, setTheme] = useState(user?.theme || 'light');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load persistence and handle initial set
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const dbTheme = user?.theme;
    const initialTheme = dbTheme || saved || 'light';

    setTheme(initialTheme);

    // Sync DB theme to localStorage if it's different and available
    if (dbTheme && dbTheme !== saved) {
      localStorage.setItem('theme', dbTheme);
    }

    setMounted(true);
  }, [user?.theme]);

  // Handle theme logic separately for clarity
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, mounted]);

  useEffect(() => {
    // Fetch notifications
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showNotifications) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInsideDropdown = dropdownRef.current?.contains(target);
      const clickedBell = notifRef.current?.contains(target);
      if (!clickedInsideDropdown && !clickedBell) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const fetchNotifications = async () => {
    const data = await getUnreadNotifications();
    setNotifications(data);
  };

  const toggleTheme = async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (user?.id) await updateUserTheme(user.id, nextTheme);
  };

  const handleMarkRead = async (id: number) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications([]);
  };

  return (
    <header className="topbar" style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)' }}>
      <div className="topbar-left flex items-center">
        <BackButton />
        <div className="hidden md:block ml-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
          </h2>
        </div>
      </div>

      <div className="topbar-right">
        <button className="icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            className="icon-btn relative"
            onClick={() => {
              console.log('Toggling notifications', !showNotifications);
              setShowNotifications(!showNotifications);
            }}
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="notif-badge">{notifications.length}</span>
            )}
          </button>
        </div>

        <div className="profile" style={{ borderLeftColor: 'var(--border)' }}>
          <div className="avatar" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="profile-text">
            <div className="profile-name" style={{ color: 'var(--text-main)' }}>{user?.name || 'User'}</div>
          </div>
        </div>
      </div>

      {mounted && typeof document !== 'undefined' && createPortal(
        showNotifications && (
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: '64px',
              right: '16px',
              zIndex: 99999,
              width: '380px',
              background: 'var(--bg-card)',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bell size={16} color="var(--primary)" />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Notifications</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                      {notifications.length > 0 ? `${notifications.length} unread` : 'All caught up'}
                    </p>
                  </div>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', border: 'none', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', letterSpacing: '0.03em' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div
              style={{ height: '288px', overflowY: 'auto' }}
              className="notif-scroll"
            >
              {notifications.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Bell size={20} color="var(--text-muted)" />
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>No new notifications</p>
                </div>
              ) : (
                notifications.map((notif, index) => {
                  const typeConfig = {
                    JOB: { icon: <FileText size={15} />, bg: 'var(--primary-light)', color: 'var(--primary)' },
                    CUSTOMER: { icon: <User size={15} />, bg: '#f0fdf4', color: '#22c55e' },
                    VEHICLE: { icon: <Car size={15} />, bg: '#faf5ff', color: '#a855f7' },
                    DEFAULT: { icon: <Bell size={15} />, bg: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }
                  };
                  const cfg = typeConfig[notif.type as keyof typeof typeConfig] || typeConfig.DEFAULT;
                  const isLast = index === notifications.length - 1;

                  return (
                    <div
                      key={notif.id}
                      className="group"
                      onClick={() => {
                        setSelectedNotification(notif);
                        setShowNotifications(false);
                        handleMarkRead(notif.id);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 20px',
                        borderBottom: isLast ? 'none' : '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        position: 'relative',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Left accent */}
                      <div style={{ position: 'absolute', left: 0, top: '12px', bottom: '12px', width: '3px', borderRadius: '0 4px 4px 0', background: cfg.color, opacity: 0.7 }} />

                      {/* Icon */}
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {cfg.icon}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {notif.message.includes(':') ? (
                            <><span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{notif.message.split(':')[0]}:</span> <strong style={{ color: 'var(--text-main)' }}>{notif.message.split(':')[1]?.trim()}</strong></>
                          ) : notif.message}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} />
                          {new Date(notif.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                          title="Dismiss"
                          style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
                          onMouseEnter={e => { (e.currentTarget.style.background = '#fef2f2'); (e.currentTarget.style.color = '#ef4444'); (e.currentTarget.style.borderColor = '#fecaca'); }}
                          onMouseLeave={e => { (e.currentTarget.style.background = 'var(--bg-card)'); (e.currentTarget.style.color = 'var(--text-muted)'); (e.currentTarget.style.borderColor = 'var(--border)'); }}
                        >
                          <X size={12} />
                        </button>
                        <ChevronRight size={14} color="var(--text-muted)" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ),
        document.body
      )}

      {mounted && createPortal(
        <AnimatePresence>
          {selectedNotification && (
            <NotificationModal
              notification={selectedNotification}
              onClose={() => setSelectedNotification(null)}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}
