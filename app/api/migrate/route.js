import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS comments JSONB;`;
        return NextResponse.json({ success: true, message: 'Migration successful: Added comments column' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
