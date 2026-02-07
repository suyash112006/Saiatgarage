'use server';

import { cookies } from 'next/headers';
import db from '@/lib/db';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Please provide both email and password' };
    }

    try {
        // Use a more resilient query for the active status
        const res = await db.query('SELECT id, name, email, username, password, role, is_active FROM users WHERE (email = $1 OR username = $1)', [email]);
        const user = res.rows[0];

        // PostgreSQL might return is_active as boolean or integer depending on how it was created
        const isActive = user && (user.is_active === 1 || user.is_active === true || user.is_active === '1');

        if (!user || !isActive || user.password !== password) {
            return { error: 'Invalid credentials or account inactive' };
        }

        // Safe serialization: Ensure no BigInts and handle potential nulls
        const sessionData = {
            id: typeof user.id === 'bigint' ? Number(user.id) : user.id,
            name: user.name,
            role: user.role,
            email: user.email,
            username: user.username
        };
        const session = JSON.stringify(sessionData);
        const cookieStore = await cookies();
        cookieStore.set('session', session, { httpOnly: true, path: '/' });

        return { success: true, role: user.role };
    } catch (err) {
        console.error(err);
        return { error: 'An internal error occurred' };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    redirect('/login');
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    if (!session) return null;
    try {
        return JSON.parse(session.value);
    } catch {
        return null;
    }
}

export async function signupAction(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return { error: 'All fields are required' };
    }

    try {
        const existingRes = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingRes.rows.length > 0) {
            return { error: 'Email already exists' };
        }

        await db.query('INSERT INTO users (name, email, password, role, is_active) VALUES ($1, $2, $3, $4, $5)', [name, email, password, 'mechanic', 1]);

        return { success: true };
    } catch (err) {
        console.error('Signup error:', err);
        return { error: 'Failed to create account' };
    }
}
