'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: number, role: string) {
    try {
        db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (err) {
        console.error('Error updating user role:', err);
        return { error: 'Failed to update user role' };
    }
}

export async function deleteUser(userId: number) {
    try {
        db.prepare('DELETE FROM users WHERE id = ?').run(userId);
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (err) {
        console.error('Error deleting user:', err);
        return { error: 'Failed to delete user' };
    }
}

export async function updateUserTheme(userId: number, theme: string) {
    try {
        db.prepare('UPDATE users SET theme = ? WHERE id = ?').run(theme, userId);
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

    try {
        db.prepare('INSERT INTO users (name, email, role, password, is_verified) VALUES (?, ?, ?, ?, ?)')
            .run(name, email, role, password, 1);

        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (err) {
        console.error('Error creating user:', err);
        return { error: 'Failed to create user' };
    }
}
export async function updateUserProfile(userId: number, name: string, email: string) {
    try {
        db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, userId);
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (err: any) {
        console.error('Error updating profile:', err);
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return { error: 'Email already exists' };
        }
        return { error: 'Failed to update profile' };
    }
}
