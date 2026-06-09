import { NextResponse } from 'next/server';
import { getUsers, saveUser } from '@/lib/database';

export async function POST(req: Request) {
  try {
    const { username, password, robloxId } = await req.json();

    if (!username || !password || !robloxId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const users = await getUsers();
    if (users.find((u: any) => u.username === username)) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      username,
      password,
      robloxId,
      status: 'pending',
      role: 'staff',
      createdAt: new Date().toISOString()
    };

    await saveUser(newUser);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
