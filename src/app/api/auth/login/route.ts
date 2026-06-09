import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/database';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    
    // Staff master password — grants access with any username
    if (password === 'password123') {
      return NextResponse.json({ success: true, role: 'staff' });
    }

    // Legacy admin account
    if (username === 'admin' && password === 'admin123') {
      return NextResponse.json({ success: true, role: 'admin' });
    }

    const users = await getUsers();
    const user = users.find((u: any) => u.username === username && u.password === password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    if (user.status !== 'approved') {
      return NextResponse.json({ error: 'Account pending management approval' }, { status: 403 });
    }

    return NextResponse.json({ success: true, role: user.role || 'staff' });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
