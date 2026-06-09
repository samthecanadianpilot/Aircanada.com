import { NextResponse } from 'next/server';
import { getUsers, updateUser } from '@/lib/database';

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { token, username, status } = await req.json();

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const success = await updateUser(username, { status });
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
