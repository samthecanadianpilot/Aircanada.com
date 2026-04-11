import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const POLLS_FILE = join(DATA_DIR, 'polls.json');

function ensureDataFile() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(POLLS_FILE)) {
    const defaultPolls = [
      {
        id: '1',
        question: 'Should we introduce the A350-1000 to the long-haul fleet?',
        options: [
          { label: 'Affirmative', votes: 0 },
          { label: 'Negative', votes: 0 },
          { label: 'Require further data', votes: 0 }
        ],
        votedIps: [],
        timestamp: new Date().toISOString()
      }
    ];
    writeFileSync(POLLS_FILE, JSON.stringify(defaultPolls, null, 2));
  }
}

function getPolls() {
  ensureDataFile();
  try {
    const raw = readFileSync(POLLS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function savePolls(polls: any[]) {
  ensureDataFile();
  writeFileSync(POLLS_FILE, JSON.stringify(polls, null, 2));
}

export async function GET() {
  return NextResponse.json(getPolls());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, pollId, optionIndex, question, options } = body;

    const polls = getPolls();

    if (action === 'vote') {
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      const pollIdx = polls.findIndex((p: any) => p.id === pollId);
      
      if (pollIdx === -1) return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
      
      const poll = polls[pollIdx];
      
      if (poll.votedIps.includes(ip)) {
        return NextResponse.json({ error: 'IP_ALREADY_VOTED' }, { status: 403 });
      }

      poll.options[optionIndex].votes += 1;
      poll.votedIps.push(ip);
      
      savePolls(polls);
      return NextResponse.json({ success: true, poll });
    }

    if (action === 'create') {
      const newPoll = {
        id: `poll-${Date.now()}`,
        question,
        options: options.map((opt: string) => ({ label: opt, votes: 0 })),
        votedIps: [],
        timestamp: new Date().toISOString()
      };
      polls.unshift(newPoll);
      savePolls(polls);
      return NextResponse.json(newPoll);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  const polls = getPolls().filter((p: any) => p.id !== id);
  savePolls(polls);
  return NextResponse.json({ success: true });
}
