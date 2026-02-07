"use client";

import React, { useState } from "react";
import { UserRow } from "./UserRow";
import { updateUserRole, deleteUser } from "@/app/actions/user";
import { Shield, UserPlus } from "lucide-react";
import AddUserModal from "./AddUserModal";

interface UserManagementProps {
    initialUsers: any[];
}

export default function UserManagement({ initialUsers }: UserManagementProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function handleUpdate(userId: number, newRole: string) {
        const result = await updateUserRole(userId, newRole);
        if (result.error) {
            alert(result.error);
            return false;
        }
        return true;
    }

    async function handleDelete(userId: number) {
        const result = await deleteUser(userId);
        if (result.error) {
            alert(result.error);
            return false;
        }
        return true;
    }

    return (
        <div className="user-management">
            <div className="card max-w-full">
                <div className="card-header">
                    <div className="header-group">
                        <div className="card-icon">
                            <Shield size={18} />
                        </div>
                        <h3>User Management</h3>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
                        <UserPlus size={16} className="mr-2" /> Add New User
                    </button>
                </div>

                <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />


                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialUsers.map((user) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
