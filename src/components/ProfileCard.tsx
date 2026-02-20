"use client";

import { useState, useEffect } from "react";
import { User, Loader2, Check, X, Shield, Lock } from "lucide-react";
import { updateUserProfile, changePassword } from "@/app/actions/user";

interface ProfileCardProps {
    user: {
        id: number;
        name: string;
        email: string;
    };
}

export default function ProfileCard({ user }: ProfileCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: user.name,
        email: user.email
    });

    // Password Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    // Handle ESC to cancel
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (showPasswordModal) setShowPasswordModal(false);
                else if (isEditing) cancelEdit();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isEditing, showPasswordModal]);

    const cancelEdit = () => {
        setForm({ name: user.name, email: user.email });
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.email.trim()) {
            alert("Name and Email are required");
            return;
        }

        setLoading(true);
        const result = await updateUserProfile(user.id, form.name, form.email);

        if (result.success) {
            setIsEditing(false);
        } else {
            alert(result.error);
        }
        setLoading(false);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
            alert("All fields are required");
            return;
        }

        if (passwordForm.new !== passwordForm.confirm) {
            alert("New passwords do not match");
            return;
        }

        if (passwordForm.new.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        setPasswordLoading(true);
        const result = await changePassword(user.id, passwordForm.current, passwordForm.new);

        if (result.success) {
            alert("Password updated successfully");
            setShowPasswordModal(false);
            setPasswordForm({ current: '', new: '', confirm: '' });
        } else {
            alert(result.error);
        }
        setPasswordLoading(false);
    }

    return (
        <>
            <div className="card flex flex-col h-full">
                <div className="card-header">
                    <div className="header-group">
                        <div className="card-icon">
                            <User size={18} />
                        </div>
                        <h3>Your Profile</h3>
                    </div>
                    <button
                        className="edit-btn"
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : (isEditing ? "Save" : "Edit")}
                    </button>
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
                            />
                        ) : (
                            user.name
                        )}
                    </div>

                    <div className="profile-label">Email Address</div>
                    <div className="profile-value">
                        {isEditing ? (
                            <input
                                className="table-input"
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                            />
                        ) : (
                            user.email
                        )}
                    </div>

                    <div className="profile-label">Password</div>
                    <div className="profile-value">••••••••</div>
                </div>

                <div className="card-footer">
                    {isEditing ? (
                        <button className="btn btn-outline text-xs" onClick={cancelEdit}>
                            <X size={14} className="mr-1" /> Cancel
                        </button>
                    ) : (
                        <button
                            className="btn btn-outline text-xs w-full flex items-center justify-center gap-2"
                            onClick={() => setShowPasswordModal(true)}
                        >
                            <Shield size={14} /> Update Password
                        </button>
                    )}
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal-content max-w-md w-full animate-in fade-in zoom-in duration-200">
                        <div className="modal-header">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <Lock size={20} />
                                </div>
                                <h2 className="text-lg font-semibold text-slate-800">Change Password</h2>
                            </div>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={passwordForm.current}
                                    onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600">New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={passwordForm.new}
                                    onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                    placeholder="Enter new password"
                                    minLength={6}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={passwordForm.confirm}
                                    onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                    placeholder="Confirm new password"
                                    minLength={6}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium text-sm"
                                    disabled={passwordLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 flex items-center gap-2"
                                >
                                    {passwordLoading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            Update Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
