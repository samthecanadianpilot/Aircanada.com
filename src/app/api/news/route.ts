import { NextResponse } from 'next/server';
import { getNews, addNews } from '@/lib/database';

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
