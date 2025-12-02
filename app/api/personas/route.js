import { NextResponse } from 'next/server';
import { getPersonas, createPersona, deletePersona } from '@/lib/db';

export async function GET() {
    try {
        const personas = await getPersonas();
        return NextResponse.json({ success: true, personas });
    } catch (error) {
        console.error('Error in GET /api/personas:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { name, description } = await request.json();

        if (!name || !description) {
            return NextResponse.json(
                { success: false, error: 'Name and description are required' },
                { status: 400 }
            );
        }

        const persona = await createPersona(name, description);
        return NextResponse.json({ success: true, persona });
    } catch (error) {
        console.error('Error in POST /api/personas:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID is required' },
                { status: 400 }
            );
        }

        await deletePersona(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/personas:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
