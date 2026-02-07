"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

interface UserRowProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    onUpdate: (userId: number, newRole: string) => Promise<boolean>;
    onDelete: (userId: number) => Promise<boolean>;
}

export function UserRow({ user, onUpdate, onDelete }: UserRowProps) {
    const [editing, setEditing] = useState(false);
    const [role, setRole] = useState(user.role);
    const [loading, setLoading] = useState(false);

    async function handleSave() {
        if (role === user.role) {
            setEditing(false);
            return;
        }
        setLoading(true);
        const success = await onUpdate(user.id, role);
        if (success) {
            setEditing(false);
        }
        setLoading(false);
    }

    async function handleDelete() {
        if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
            setLoading(true);
            await onDelete(user.id);
            setLoading(false);
        }
    }

    return (
        <tr>
            <td className="name-cell">{user.name}</td>
            <td className="text-muted">{user.email}</td>

            <td>
                {editing ? (
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="table-select"
                        disabled={loading}
                    >
                        <option value="admin">Admin</option>
                        <option value="mechanic">Mechanic</option>
                    </select>
                ) : (
                    <span className={`role-badge ${user.role}`}>
                        {user.role}
                    </span>
                )}
            </td>

            <td className="actions-cell">
                {editing ? (
                    <>
                        <button
                            className="icon-btn success"
                            onClick={handleSave}
                            disabled={loading}
                            title="Save Changes"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        </button>
                        <button
                            className="icon-btn"
                            onClick={() => {
                                setEditing(false);
                                setRole(user.role);
                            }}
                            disabled={loading}
                            title="Cancel"
                        >
                            <X size={16} />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="icon-btn"
                            onClick={() => setEditing(true)}
                            title="Edit Role"
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            className="icon-btn danger"
                            onClick={handleDelete}
                            title="Delete User"
                        >
                            <Trash2 size={16} />
                        </button>
                    </>
                )}
            </td>
        </tr>
    );
}
