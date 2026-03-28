"use client";

import { useState, useEffect } from "react";
import { User, Loader2, Check, X, Shield, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { updateUserProfile, changePassword } from "@/app/actions/user";
import { toast } from "sonner";

interface ProfileCardProps {
    user: {
        id: number;
        name: string;
        email: string;
        role?: string;
    };
}

export default function ProfileCard({ user }: ProfileCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: user.name, email: user.email });

    // Password modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

    const cancelEdit = () => {
        setForm({ name: user.name, email: user.email });
        setIsEditing(false);
    };

    // ESC to cancel
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (showPasswordModal) {
                    setShowPasswordModal(false);
                    setPasswordForm({ current: '', new: '', confirm: '' });
                } else if (isEditing) {
                    cancelEdit();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isEditing, showPasswordModal]);

    const handleSave = async () => {
        if (!form.name.trim()) { toast.error("Name is required"); return; }
        if (!form.email.trim() || !form.email.includes('@')) { toast.error("Valid email is required"); return; }

        setLoading(true);
        const result = await updateUserProfile(user.id, form.name, form.email);

        if (result.success) {
            toast.success("Profile updated successfully");
            setIsEditing(false);
            // Brief delay then reload to reflect new name in topbar
            setTimeout(() => window.location.reload(), 800);
        } else {
            toast.error(result.error || "Failed to update profile");
        }
        setLoading(false);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordForm.current) { toast.error("Current password is required"); return; }
        if (!passwordForm.new) { toast.error("New password is required"); return; }
        if (passwordForm.new.length < 6) { toast.error("New password must be at least 6 characters"); return; }
        if (passwordForm.new !== passwordForm.confirm) { toast.error("New passwords do not match"); return; }
        if (passwordForm.new === passwordForm.current) { toast.error("New password must be different from current"); return; }

        setPasswordLoading(true);
        const result = await changePassword(user.id, passwordForm.current, passwordForm.new);

        if (result.success) {
            toast.success("Password changed successfully");
            setShowPasswordModal(false);
            setPasswordForm({ current: '', new: '', confirm: '' });
        } else {
            toast.error(result.error || "Failed to change password");
        }
        setPasswordLoading(false);
    };

    const passwordStrength = (pw: string) => {
        if (!pw) return null;
        if (pw.length < 6) return { label: 'Too short', color: '#ef4444', pct: 20 };
        if (pw.length < 8) return { label: 'Weak', color: '#f59e0b', pct: 40 };
        if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { label: 'Fair', color: '#eab308', pct: 60 };
        if (pw.length >= 10) return { label: 'Strong', color: '#10b981', pct: 100 };
        return { label: 'Good', color: '#3b82f6', pct: 80 };
    };

    const strength = passwordStrength(passwordForm.new);

    return (
        <>
            <div className="card flex flex-col h-full">
                <div className="card-header">
                    <div className="header-group">
                        <div className="card-icon">
                            <User size={18} />
                        </div>
                        <div>
                            <h3>Your Profile</h3>
                            {user.role && (
                                <span style={{
                                    fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em',
                                    textTransform: 'uppercase', color: '#3b82f6',
                                    background: 'rgba(59,130,246,0.1)', padding: '2px 8px',
                                    borderRadius: '999px', display: 'inline-block', marginTop: '4px',
                                }}>
                                    {user.role}
                                </span>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {isEditing && (
                            <button
                                className="edit-btn"
                                onClick={cancelEdit}
                                style={{ color: 'var(--text-muted)' }}
                            >
                                <X size={14} style={{ marginRight: '4px' }} /> Cancel
                            </button>
                        )}
                        <button
                            className="edit-btn"
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            disabled={loading}
                            style={isEditing ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' } : {}}
                        >
                            {loading
                                ? <Loader2 size={14} className="animate-spin" />
                                : isEditing
                                    ? <><Check size={14} style={{ marginRight: '4px', display: 'inline' }} />Save</>
                                    : 'Edit'
                            }
                        </button>
                    </div>
                </div>

                <div className="profile-grid">
                    <div className="profile-label">Full Name</div>
                    <div className="profile-value">
                        {isEditing ? (
                            <input
                                className="table-input"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                autoFocus
                                placeholder="Your full name"
                            />
                        ) : user.name}
                    </div>

                    <div className="profile-label">Email Address</div>
                    <div className="profile-value">
                        {isEditing ? (
                            <input
                                className="table-input"
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="your@email.com"
                            />
                        ) : user.email}
                    </div>

                    <div className="profile-label">Password</div>
                    <div className="profile-value">••••••••</div>
                </div>

                <div className="card-footer">
                    <button
                        className="btn btn-outline text-xs w-full flex items-center justify-center gap-2"
                        onClick={() => setShowPasswordModal(true)}
                    >
                        <Shield size={14} /> Update Password
                    </button>
                </div>
            </div>

            {/* ── Change Password Modal ── */}
            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal-content max-w-md w-full" style={{ borderRadius: '20px' }}>
                        {/* Header */}
                        <div style={{
                            padding: '22px 24px 0',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '42px', height: '42px', borderRadius: '12px',
                                    background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
                                }}>
                                    <Lock size={18} color="#fff" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                                        Change Password
                                    </h3>
                                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                        Applies to your account only
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setShowPasswordModal(false); setPasswordForm({ current: '', new: '', confirm: '' }); }}
                                style={{
                                    width: '32px', height: '32px', borderRadius: '9px',
                                    border: '1px solid var(--border)', background: 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', color: 'var(--text-muted)',
                                }}
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <form onSubmit={handleChangePassword} style={{ padding: '20px 24px 24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                                {/* Current Password */}
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                                        Current Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showCurrent ? 'text' : 'password'}
                                            required
                                            value={passwordForm.current}
                                            onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                            placeholder="Enter current password"
                                            autoComplete="current-password"
                                            style={{
                                                width: '100%', padding: '10px 40px 10px 14px',
                                                borderRadius: '10px', border: '1.5px solid var(--border)',
                                                background: 'var(--bg-main)', color: 'var(--text-main)',
                                                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                                            }}
                                        />
                                        <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                                        New Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showNew ? 'text' : 'password'}
                                            required
                                            minLength={6}
                                            value={passwordForm.new}
                                            onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                            placeholder="Min. 6 characters"
                                            autoComplete="new-password"
                                            style={{
                                                width: '100%', padding: '10px 40px 10px 14px',
                                                borderRadius: '10px', border: '1.5px solid var(--border)',
                                                background: 'var(--bg-main)', color: 'var(--text-main)',
                                                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                                            }}
                                        />
                                        <button type="button" onClick={() => setShowNew(!showNew)}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {/* Strength bar */}
                                    {strength && (
                                        <div style={{ marginTop: '8px' }}>
                                            <div style={{ height: '4px', borderRadius: '999px', background: 'var(--border)', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${strength.pct}%`, background: strength.color, borderRadius: '999px', transition: 'all 0.3s' }} />
                                            </div>
                                            <p style={{ fontSize: '11px', fontWeight: 600, color: strength.color, marginTop: '4px' }}>{strength.label}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                                        Confirm New Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            required
                                            minLength={6}
                                            value={passwordForm.confirm}
                                            onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                            placeholder="Re-enter new password"
                                            autoComplete="new-password"
                                            style={{
                                                width: '100%', padding: '10px 40px 10px 14px',
                                                borderRadius: '10px',
                                                border: `1.5px solid ${passwordForm.confirm
                                                    ? passwordForm.confirm === passwordForm.new ? '#10b981' : '#ef4444'
                                                    : 'var(--border)'}`,
                                                background: 'var(--bg-main)', color: 'var(--text-main)',
                                                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                                            }}
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        {/* Match indicator */}
                                        {passwordForm.confirm && (
                                            <div style={{ position: 'absolute', right: '36px', top: '50%', transform: 'translateY(-50%)' }}>
                                                {passwordForm.confirm === passwordForm.new
                                                    ? <CheckCircle2 size={16} color="#10b981" />
                                                    : <AlertCircle size={16} color="#ef4444" />
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer buttons */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowPasswordModal(false); setPasswordForm({ current: '', new: '', confirm: '' }); }}
                                    disabled={passwordLoading}
                                    style={{
                                        flex: 1, padding: '10px', borderRadius: '10px',
                                        border: '1.5px solid var(--border)', background: 'transparent',
                                        color: 'var(--text-muted)', fontWeight: 600, fontSize: '13px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    style={{
                                        flex: 2, padding: '10px 20px', borderRadius: '10px',
                                        background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                                        color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px',
                                        cursor: passwordLoading ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
                                        opacity: passwordLoading ? 0.7 : 1,
                                    }}
                                >
                                    {passwordLoading
                                        ? <><Loader2 size={15} className="animate-spin" /> Updating…</>
                                        : <><Lock size={15} /> Update Password</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
