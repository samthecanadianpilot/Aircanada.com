import { NextResponse } from 'next/server';
import { getMagazines, addMagazine, updateMagazine, deleteMagazine } from '@/lib/database';

export async function GET() {
  try {
    const magazines = await getMagazines();
    return NextResponse.json(magazines);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch magazines' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const token = formData.get('token') as string;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const fileUrl = formData.get('fileUrl') as string;
    const coverImageUrl = formData.get('coverImageUrl') as string;

    const newMagazine = {
      id: `mag-${Date.now()}`,
      date: new Date().toISOString(),
      title,
      description,
      fileUrl: fileUrl || null,
      coverImageUrl: coverImageUrl || null,
      status: 'Draft',
    };

    await addMagazine(newMagazine);
    return NextResponse.json({ success: true, magazine: newMagazine });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add magazine' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const token = formData.get('token') as string;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const fileUrl = formData.get('fileUrl') as string;
    const coverImageUrl = formData.get('coverImageUrl') as string;
    const status = formData.get('status') as string;

    const updates: any = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (fileUrl !== null) updates.fileUrl = fileUrl;
    if (coverImageUrl !== null) updates.coverImageUrl = coverImageUrl;
    if (status) updates.status = status;

    const success = await updateMagazine(id, updates);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Magazine not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update magazine' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const token = searchParams.get('token');

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const success = await deleteMagazine(id);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Magazine not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete magazine' }, { status: 500 });
  }
}
