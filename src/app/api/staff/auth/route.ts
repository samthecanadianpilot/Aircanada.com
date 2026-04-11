import { NextResponse } from 'next/server';

// Server-side password — NOT exposed to the frontend bundle
const STAFF_PASSWORD = 'gamo123';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password === STAFF_PASSWORD) {
      // Generate a simple session token (timestamp-based for simplicity)
      const token = Buffer.from(`staff-${Date.now()}-${STAFF_PASSWORD}`).toString('base64');
      
      return NextResponse.json({ 
        success: true, 
        token 
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid password' }, 
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' }, 
      { status: 400 }
    );
  }
}
