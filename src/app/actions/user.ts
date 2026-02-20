'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: number, role: string) {
    try {
        await db.query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (err) {
        console.error('Error updating user role:', err);
        return { error: 'Failed to update user role' };
    }
}

export async function deleteUser(userId: number) {
    try {
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (err) {
        console.error('Error deleting user:', err);
        return { error: 'Failed to delete user' };
    }
}

export async function updateUserTheme(userId: number, theme: string) {
    try {
        await db.query('UPDATE users SET theme = $1 WHERE id = $2', [theme, userId]);
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (err) {
        console.error('Error updating user theme:', err);
        return { error: 'Failed to update user theme' };
    }
}

export async function createUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const password = formData.get('password') as string;
    const username = email.split('@')[0];

    try {
        await db.query('INSERT INTO users (name, email, username, role, password, is_active) VALUES ($1, $2, $3, $4, $5, $6)', [name, email, username, role, password, 1]);

        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (err: any) {
        console.error('Error creating user:', err);
        if (err.code === '23505') { // Postgres UNIQUE violation
            return { error: 'Email already exists' };
        }
        return { error: `Failed to create user: ${err.message}` };
    }
}
export async function updateUserProfile(userId: number, name: string, email: string) {
    try {
        await db.query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [name, email, userId]);
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (err: any) {
        console.error('Error updating profile:', err);
        if (err.code === '23505') { // Postgres UNIQUE violation
            return { error: 'Email already exists' };
        }
        return { error: 'Failed to update profile' };
    }
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string) {
    try {
        const userRes = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
        const user = userRes.rows[0];

        if (!user) return { error: 'User not found' };

        if (user.password !== currentPassword) {
            return { error: 'Incorrect current password' };
        }

        await db.query('UPDATE users SET password = $1 WHERE id = $2', [newPassword, userId]);
        return { success: true };
    } catch (err) {
        console.error('Error changing password:', err);
        return { error: 'Failed to change password' };
    }
}
