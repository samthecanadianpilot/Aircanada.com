import { NextResponse } from 'next/server';
import { getTeamMembers, updateTeamMembers } from '@/lib/database';

export async function GET() {
  try {
    const team = await getTeamMembers();
    return NextResponse.json(team);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const newMember = await req.json();
    newMember.id = 'member-' + Date.now().toString();
    
    const team = await getTeamMembers();
    newMember.order = team.length;
    team.push(newMember);
    
    await updateTeamMembers(team);
    
    return NextResponse.json({ success: true, member: newMember });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { members } = await req.json();
    await updateTeamMembers(members);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const team = await getTeamMembers();
    const newTeam = team.filter((m: any) => m.id !== id);
    await updateTeamMembers(newTeam);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
