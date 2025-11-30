import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';
const SESSION_COOKIE = 'admin_session';

// Hash the password for comparison
export async function verifyPassword(password) {
    // For simplicity, we'll use direct comparison
    // In production, you'd hash the env variable too
    return password === ADMIN_PASSWORD;
}

// Create session
export async function createSession() {
    const sessionToken = generateSessionToken();
    cookies().set(SESSION_COOKIE, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
    });
    return sessionToken;
}

// Check if user is authenticated
export async function isAuthenticated() {
    const cookieStore = cookies();
    const session = cookieStore.get(SESSION_COOKIE);
    return !!session?.value;
}

// Destroy session
export async function destroySession() {
    cookies().delete(SESSION_COOKIE);
}

// Generate random session token
function generateSessionToken() {
    return Array.from({ length: 32 }, () =>
        Math.random().toString(36).charAt(2)
    ).join('');
}
