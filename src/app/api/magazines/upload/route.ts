import { NextResponse } from 'next/server';
import { getMagazines, addMagazine, updateMagazine } from '@/lib/database';

// POST: Upload a PDF (base64-encoded pages array) and create a new magazine
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, coverImageUrl, pages, magazineId } = body;

    // If magazineId is provided, update existing magazine with PDF pages
    if (magazineId) {
      const success = await updateMagazine(magazineId, {
        pdfPages: pages, // array of base64 PNG data URLs
        pageCount: pages.length,
        updatedAt: new Date().toISOString(),
      });

      if (success) {
        return NextResponse.json({ success: true, id: magazineId });
      }
      return NextResponse.json({ error: 'Magazine not found' }, { status: 404 });
    }

    // Create a new magazine entry with PDF pages
    const newMagazine = {
      id: `mag-${Date.now()}`,
      date: new Date().toISOString(),
      title: title || 'Untitled Magazine',
      description: description || '',
      coverImageUrl: coverImageUrl || (pages && pages.length > 0 ? pages[0] : null),
      pdfPages: pages || [],
      pageCount: pages ? pages.length : 0,
      status: 'Draft',
    };

    await addMagazine(newMagazine);
    return NextResponse.json({ success: true, magazine: newMagazine });
  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ error: 'Failed to process PDF upload' }, { status: 500 });
  }
}
