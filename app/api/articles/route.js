import { NextResponse } from 'next/server';
import { getAllArticles, createArticle } from '@/lib/db';

// GET all articles
export async function GET() {
    try {
        const articles = await getAllArticles();
        return NextResponse.json({ success: true, articles });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST create new article
export async function POST(request) {
    try {
        const articleData = await request.json();
        const result = await createArticle(articleData);

        if (result.success) {
            return NextResponse.json(result, { status: 201 });
        } else {
            return NextResponse.json(result, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
