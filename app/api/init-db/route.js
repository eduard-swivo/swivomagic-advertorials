import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

// Initialize database schema
export async function GET() {
    try {
        const result = await initDatabase();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
