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
        const res = await db.query('SELECT * FROM users WHERE (email = $1 OR username = $1) AND is_active = 1', [email]);
        const user = res.rows[0];

        if (!user || user.password !== password) {
            return { error: 'Invalid credentials or account inactive' };
        }

        const session = JSON.stringify({ id: user.id, name: user.name, role: user.role, email: user.email, username: user.username });
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

        await db.query('INSERT INTO users (name, email, password, role, is_verified) VALUES ($1, $2, $3, $4, $5)', [name, email, password, 'mechanic', 1]);

        return { success: true };
    } catch (err) {
        console.error('Signup error:', err);
        return { error: 'Failed to create account' };
    }
}
