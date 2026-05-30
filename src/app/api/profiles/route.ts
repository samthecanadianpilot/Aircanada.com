import { NextResponse } from 'next/server';
import { getProfiles, updateProfile } from '@/lib/database';

export async function GET() {
  try {
    const profiles = await getProfiles();
    return NextResponse.json(profiles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { discordId, updates } = data;

    if (!discordId || !updates) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const success = await updateProfile(discordId, updates);
    if (!success) throw new Error("DB write failed");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
