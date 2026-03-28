'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getSession } from '@/app/actions/auth';

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
        await db.query(
            'INSERT INTO users (name, email, username, role, password, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
            [name, email, username, role, password, 1]
        );
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (err: any) {
        console.error('Error creating user:', err);
        if (err.code === '23505') return { error: 'Email already exists' };
        return { error: `Failed to create user: ${err.message}` };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PROFILE — works for both Admin and Mechanic
// ─────────────────────────────────────────────────────────────────────────────
export async function updateUserProfile(userId: number, name: string, email: string) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized - please log in again' };

    // Users can only update their own profile (admins can update any)
    if (session.id !== userId && session.role !== 'admin') {
        return { error: 'You can only update your own profile' };
    }

    if (!name.trim()) return { error: 'Name is required' };
    if (!email.trim() || !email.includes('@')) return { error: 'Please enter a valid email address' };

    try {
        // Check email uniqueness excluding own account
        const emailCheck = await db.query(
            'SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2',
            [email.trim(), userId]
        );
        if (emailCheck.rows.length > 0) {
            return { error: 'This email is already used by another account' };
        }

        await db.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3',
            [name.trim(), email.trim(), userId]
        );

        // Refresh the session cookie immediately so the topbar / sidebar
        // show the updated name without requiring a re-login
        if (session.id === userId) {
            const updatedSession = { ...session, name: name.trim(), email: email.trim() };
            const cookieStore = await cookies();
            cookieStore.set('session', JSON.stringify(updatedSession), {
                httpOnly: true,
                path: '/',
            });
        }

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (err: any) {
        console.error('Error updating profile:', err);
        if (err.code === '23505') return { error: 'Email already exists' };
        return { error: `Failed to update profile: ${err.message}` };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE PASSWORD — works for both Admin and Mechanic
// Admin changing another user's password skips the "current password" check
// ─────────────────────────────────────────────────────────────────────────────
export async function changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized - please log in again' };

    const isChangingOwn = session.id === userId;

    // Only the user themselves or an admin may change this password
    if (!isChangingOwn && session.role !== 'admin') {
        return { error: 'You can only change your own password' };
    }

    if (!newPassword || newPassword.length < 6) {
        return { error: 'New password must be at least 6 characters' };
    }

    try {
        const userRes = await db.query('SELECT id, password FROM users WHERE id = $1', [userId]);
        const user = userRes.rows[0];
        if (!user) return { error: 'User not found' };

        // Verify current password only when the user is changing their own
        if (isChangingOwn && user.password !== currentPassword) {
            return { error: 'Current password is incorrect' };
        }

        await db.query('UPDATE users SET password = $1 WHERE id = $2', [newPassword, userId]);
        return { success: true };
    } catch (err: any) {
        console.error('Error changing password:', err);
        return { error: `Failed to change password: ${err.message}` };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE USER ACTIVE — Admin only
// ─────────────────────────────────────────────────────────────────────────────
export async function toggleUserActive(userId: number) {
    const session = await getSession();
    if (session?.role !== 'admin') return { error: 'Admin access required' };

    try {
        await db.query(
            'UPDATE users SET is_active = 1 - COALESCE(is_active, 1) WHERE id = $1',
            [userId]
        );
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (err: any) {
        return { error: `Failed to toggle user status: ${err.message}` };
    }
}
