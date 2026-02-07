"use client";

import { useState, useEffect } from "react";
import { User, Loader2, Check, X } from "lucide-react";
import { updateUserProfile } from "@/app/actions/user";

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

    // Handle ESC to cancel
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isEditing) {
                cancelEdit();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isEditing]);

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

    return (
        <div className="card">
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
                    <button className="btn btn-outline text-xs">Update Password</button>
                )}
            </div>
        </div>
    );
}
