import { NextResponse } from 'next/server';
import { deleteProduct } from '@/lib/db';

export async function DELETE(request, { params }) {
    try {
        const success = await deleteProduct(params.id);
        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
