import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const TEAM_FILE = join(DATA_DIR, 'team.json');

function ensureDataFile() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(TEAM_FILE)) {
    const defaultTeam = [
      { id: '1', name: 'Alpha', role: 'CEO', pfp: null, order: 0 },
      { id: '2', name: 'Bravo', role: 'Flight Instructor', pfp: null, order: 1 },
      { id: '3', name: 'Charlie', role: 'Safety Officer', pfp: null, order: 2 },
    ];
    writeFileSync(TEAM_FILE, JSON.stringify(defaultTeam, null, 2));
  }
}

function getTeam() {
  ensureDataFile();
  try {
    const raw = readFileSync(TEAM_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveTeam(team: any[]) {
  ensureDataFile();
  writeFileSync(TEAM_FILE, JSON.stringify(team, null, 2));
}

export async function GET() {
  const team = getTeam();
  team.sort((a: any, b: any) => a.order - b.order);
  return NextResponse.json(team);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, pfp } = body;

    const team = getTeam();
    const newMember = {
      id: `member-${Date.now()}`,
      name,
      role,
      pfp,
      order: team.length
    };

    team.push(newMember);
    saveTeam(team);

    return NextResponse.json(newMember);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { members } = body; // Expecting full ordered array

    if (Array.isArray(members)) {
      const updatedMembers = members.map((m, index) => ({
        ...m,
        order: index
      }));
      saveTeam(updatedMembers);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  const team = getTeam().filter((m: any) => m.id !== id);
  saveTeam(team);

  return NextResponse.json({ success: true });
}
