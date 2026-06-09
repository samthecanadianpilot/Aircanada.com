import { NextResponse } from 'next/server';
import { getFileData, saveFileData } from '@/lib/database';

export async function PUT(req: Request) {
  try {
    const { token, id, canvasData } = await req.json();

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const magazines = await getFileData('magazines.json', []);
    const idx = magazines.findIndex((m: any) => m.id === id);
    
    if (idx !== -1) {
      magazines[idx].canvasData = canvasData;
      await saveFileData('magazines.json', magazines);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Magazine not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save canvas' }, { status: 500 });
  }
}
