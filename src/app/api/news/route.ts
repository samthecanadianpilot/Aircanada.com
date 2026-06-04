import { NextResponse } from 'next/server';
import { getNews, addNews, updateNews, deleteNews } from '@/lib/database';

export async function GET() {
  try {
    const news = await getNews();
    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const token = formData.get('token') as string;

    // Check valid request (using basic token logic for now)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const headline = formData.get('headline') as string;
    const content = formData.get('content') as string;
    const category = (formData.get('category') as string) || 'Alert';
    const imageUrl = formData.get('image') as string;

    const newPost = {
      id: `post-${Date.now()}`,
      date: new Date().toISOString(),
      headline,
      content,
      category,
      imageUrl: imageUrl || null
    };

    await addNews(newPost);
    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add news' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const token = formData.get('token') as string;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = formData.get('id') as string;
    const headline = formData.get('headline') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    const imageUrl = formData.get('image') as string;

    const updates: any = {};
    if (headline) updates.headline = headline;
    if (content) updates.content = content;
    if (category) updates.category = category;
    if (imageUrl) updates.imageUrl = imageUrl;

    const success = await updateNews(id, updates);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const token = searchParams.get('token');

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const success = await deleteNews(id);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
  }
}
