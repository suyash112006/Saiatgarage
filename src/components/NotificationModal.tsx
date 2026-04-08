'use client';

import { X, ArrowRight, Bell, FileText, User, Car, Clock, CheckCircle, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NotificationModalProps {
    notification: any;
    onClose: () => void;
}

export default function NotificationModal({ notification, onClose }: NotificationModalProps) {
    const router = useRouter();

    if (!notification) return null;

    const handleAction = () => {
        if (notification.type === 'JOB' && notification.reference_id) {
            router.push(`/dashboard/jobs/${notification.reference_id}`);
        } else if (notification.type === 'CUSTOMER' && notification.reference_id) {
            router.push(`/dashboard/customers/${notification.reference_id}`);
        } else if (notification.type === 'VEHICLE' && notification.reference_id) {
            onClose();
            return;
        }
        onClose();
    };

    // Type-based theme config
    const themes: Record<string, { icon: any; label: string; gradient: string; accent: string; glow: string; iconBg: string; badge: string }> = {
        JOB: {
            icon: FileText,
            label: 'Job Update',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            accent: '#3b82f6',
            glow: 'rgba(59,130,246,0.3)',
            iconBg: 'rgba(59,130,246,0.15)',
            badge: 'rgba(59,130,246,0.12)',
        },
        CUSTOMER: {
            icon: User,
            label: 'New Customer',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            accent: '#10b981',
            glow: 'rgba(16,185,129,0.3)',
            iconBg: 'rgba(16,185,129,0.15)',
            badge: 'rgba(16,185,129,0.12)',
        },
        VEHICLE: {
            icon: Car,
            label: 'Vehicle Added',
            gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
            accent: '#a855f7',
            glow: 'rgba(168,85,247,0.3)',
            iconBg: 'rgba(168,85,247,0.15)',
            badge: 'rgba(168,85,247,0.12)',
        },
    };

    const theme = themes[notification.type] || {
        icon: Bell,
        label: 'System Alert',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        accent: '#f59e0b',
        glow: 'rgba(245,158,11,0.3)',
        iconBg: 'rgba(245,158,11,0.15)',
        badge: 'rgba(245,158,11,0.12)',
    };

    const Icon = theme.icon;
    const timeStr = new Date(notification.created_at).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
    const hasAction = notification.type === 'JOB' || notification.type === 'CUSTOMER';

    return (
        <>
            <style>{`
                @keyframes notif-backdrop-in  { from { opacity: 0 } to { opacity: 1 } }
                @keyframes notif-card-in      { from { opacity: 0; transform: translateY(28px) scale(0.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
                @keyframes notif-pulse-ring   { 0%,100% { transform: scale(1); opacity: 0.5 } 50% { transform: scale(1.18); opacity: 0 } }
                .notif-close:hover { background: rgba(239,68,68,0.12) !important; color: #ef4444 !important; }
                .notif-secondary:hover { border-color: var(--border) !important; color: var(--text-main) !important; }
            `}</style>

            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9990,
                    background: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(8px)',
                    animation: 'notif-backdrop-in 0.2s ease',
                }}
            />

            {/* Card */}
            <div
                style={{
                    position: 'fixed', inset: 0, zIndex: 9991,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '16px',
                    pointerEvents: 'none',
                }}
            >
                <div
                    style={{
                        width: '100%', maxWidth: '440px',
                        background: 'var(--bg-card)',
                        borderRadius: '24px',
                        border: '1px solid var(--border)',
                        boxShadow: `0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)`,
                        overflow: 'hidden',
                        animation: 'notif-card-in 0.28s cubic-bezier(0.34,1.56,0.64,1)',
                        pointerEvents: 'all',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ── Gradient Banner ── */}
                    <div style={{
                        height: '5px',
                        background: theme.gradient,
                        boxShadow: `0 0 16px ${theme.glow}`,
                    }} />

                    {/* ── Header ── */}
                    <div style={{
                        padding: '24px 24px 0',
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                        gap: '12px',
                    }}>
                        {/* Left: Icon + Title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            {/* Pulsing icon */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                {/* Outer pulse ring */}
                                <div style={{
                                    position: 'absolute', inset: '-6px',
                                    borderRadius: '50%',
                                    border: `1.5px solid ${theme.accent}`,
                                    animation: 'notif-pulse-ring 2.4s ease-in-out infinite',
                                }} />
                                {/* Icon circle */}
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '16px',
                                    background: theme.iconBg,
                                    border: `1.5px solid ${theme.accent}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 4px 16px ${theme.glow}`,
                                }}>
                                    <Icon size={20} color={theme.accent} strokeWidth={2.2} />
                                </div>
                            </div>

                            <div>
                                <h3 style={{
                                    margin: 0, fontSize: '17px', fontWeight: 800,
                                    color: 'var(--text-main)', letterSpacing: '-0.4px',
                                }}>
                                    {theme.label}
                                </h3>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    marginTop: '4px',
                                }}>
                                    <Clock size={11} color="var(--text-muted)" />
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                        {timeStr}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="notif-close"
                            style={{
                                width: '34px', height: '34px', borderRadius: '10px',
                                border: '1px solid var(--border)',
                                background: 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: 'var(--text-muted)',
                                transition: 'all 0.15s', flexShrink: 0,
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* ── Body ── */}
                    <div style={{ padding: '20px 24px' }}>
                        {/* Message bubble */}
                        <div style={{
                            background: 'var(--bg-main)',
                            border: `1.5px solid ${theme.accent}22`,
                            borderLeft: `3.5px solid ${theme.accent}`,
                            borderRadius: '12px',
                            padding: '16px 18px',
                            marginBottom: '16px',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            {/* Subtle glow spot */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0,
                                width: '60px', height: '100%',
                                background: `linear-gradient(90deg, ${theme.accent}08 0%, transparent 100%)`,
                                pointerEvents: 'none',
                            }} />
                            <p style={{
                                margin: 0, fontSize: '14px', fontWeight: 500,
                                color: 'var(--text-main)', lineHeight: 1.6,
                                position: 'relative',
                            }}>
                                {notification.message}
                            </p>
                        </div>

                        {/* Reference ID pill */}
                        {notification.reference_id && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    fontSize: '10px', fontWeight: 800,
                                    textTransform: 'uppercase', letterSpacing: '0.08em',
                                    color: 'var(--text-muted)',
                                }}>
                                    Reference
                                </span>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    padding: '4px 10px', borderRadius: '999px',
                                    background: theme.badge,
                                    border: `1px solid ${theme.accent}25`,
                                }}>
                                    <Hash size={10} color={theme.accent} />
                                    <span style={{
                                        fontSize: '12px', fontFamily: 'monospace',
                                        fontWeight: 800, color: theme.accent,
                                    }}>
                                        {notification.reference_id}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    <div style={{
                        padding: '0 24px 24px',
                        display: 'flex', gap: '10px',
                        justifyContent: hasAction ? 'space-between' : 'flex-end',
                    }}>
                        <button
                            onClick={onClose}
                            className="notif-secondary"
                            style={{
                                flex: hasAction ? 1 : undefined,
                                padding: '11px 20px', borderRadius: '12px',
                                border: '1.5px solid var(--border)',
                                background: 'transparent',
                                color: 'var(--text-muted)',
                                fontWeight: 700, fontSize: '13.5px',
                                cursor: 'pointer', transition: 'all 0.15s',
                            }}
                        >
                            Dismiss
                        </button>

                        {hasAction && (
                            <button
                                onClick={handleAction}
                                style={{
                                    flex: 1,
                                    padding: '11px 20px', borderRadius: '12px',
                                    background: theme.gradient,
                                    color: '#fff',
                                    border: 'none',
                                    fontWeight: 700, fontSize: '13.5px',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    boxShadow: `0 4px 20px ${theme.glow}`,
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                                <CheckCircle size={15} strokeWidth={2.5} />
                                View Details
                                <ArrowRight size={14} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
