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
        console.log('Login attempt for:', email);
        console.log('Step 1: Querying database for:', email);
        const res = await db.query('SELECT id, name, email, username, password, role, is_active FROM users WHERE (LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1))', [email]);
        const user = res.rows[0];
        console.log('Step 2: Database result received. User found:', !!user);

        if (user) {
            console.log('Step 2a: User details - ID type:', typeof user.id, 'is_active type:', typeof user.is_active, 'Value:', user.is_active);
        }

        // PostgreSQL might return is_active as boolean or integer depending on how it was created
        const isActive = user && (user.is_active === 1 || user.is_active === true || user.is_active === '1');
        console.log('Step 3: isActive check:', isActive);

        const passwordMatch = user && user.password === password;
        console.log('Step 4: Password match:', passwordMatch);

        if (!user || !isActive || !passwordMatch) {
            console.log('Step 4b: Validation failed - returning unauthorized');
            return { error: 'Invalid credentials or account inactive' };
        }

        console.log('Step 5: Preparing session data');
        // Safe serialization: Ensure no BigInts and handle potential nulls
        const sessionData = {
            id: typeof user.id === 'bigint' ? Number(user.id) : user.id,
            name: user.name,
            role: user.role,
            email: user.email,
            username: user.username
        };
        const session = JSON.stringify(sessionData);

        console.log('Step 6: Accessing cookies()');
        const cookieStore = await cookies();
        console.log('Step 7: Setting session cookie');
        cookieStore.set('session', session, { httpOnly: true, path: '/' });

        console.log('Step 8: Login successful');
        return { success: true, role: user.role };
    } catch (err: any) {
        console.error('--- Login Action Error ---');
        console.error('Message:', err.message);
        if (err.stack) console.error('Stack:', err.stack);
        console.error('---------------------------');
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
