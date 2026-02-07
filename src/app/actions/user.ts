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
        await db.query('INSERT INTO users (name, email, role, password, is_verified) VALUES ($1, $2, $3, $4, $5)', [name, email, role, password, 1]);

        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (err) {
        console.error('Error creating user:', err);
        return { error: 'Failed to create user' };
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
