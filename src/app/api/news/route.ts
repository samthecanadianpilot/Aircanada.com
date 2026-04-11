import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const STAFF_PASSWORD = 'gamo123';
const DATA_DIR = join(process.cwd(), 'data');
const NEWS_FILE = join(DATA_DIR, 'news.json');

// Ensure data directory and file exist
function ensureDataFile() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(NEWS_FILE)) {
    writeFileSync(NEWS_FILE, JSON.stringify(getSeedData(), null, 2));
  }
}

function getSeedData() {
  return [
    {
      id: 'seed-1',
      headline: 'Aviation Safety Alert: CRJ Regional Jet Incident at New York (JFK)',
      category: 'Alert',
      content: 'All regional flight operations are under temporary safety review following a landing incident involving a CRJ-900 at New York JFK. No injuries reported. All affected passengers have been rebooked on alternative flights. Our maintenance team is conducting a thorough investigation alongside the NTSB.',
      image: null,
      date: '2026-03-24T12:00:00.000Z',
    },
    {
      id: 'seed-2',
      headline: 'Service Suspension: Middle East Hubs (DXB, DOH)',
      category: 'Alert',
      content: 'Due to regional tensions and airspace restrictions, all AirCanada PTFS flights to Dubai and Doha are suspended until further notice. Passengers with existing bookings will be accommodated on partner airline services.',
      image: null,
      date: '2026-03-23T12:00:00.000Z',
    },
    {
      id: 'seed-3',
      headline: 'Easter Mega-Flight: 75 Members Fly Formation to London',
      category: 'Event',
      content: 'A new record! Our annual Easter event saw 75 pilots successfully complete a formation flight from YYZ to LHR. Thank you to all who joined. This event broke the previous record of 52 participants set during the 2025 Summer Air Show.',
      image: null,
      date: '2026-03-22T12:00:00.000Z',
    },
    {
      id: 'seed-4',
      headline: 'Spring Flight Schedule Released',
      category: 'Flight',
      content: 'Over 50 new daily flights added to the spring schedule. Book your favorite domestic and international routes now. New destinations include Reykjavik (KEF), Lisbon (LIS), and Manila (MNL).',
      image: null,
      date: '2026-03-20T12:00:00.000Z',
    },
    {
      id: 'seed-5',
      headline: '7,000 Members Milestone',
      category: 'Community',
      content: 'The AirCanada PTFS community has officially surpassed 7,000 active Discord members. Thank you to all our pilots! Special shoutout to our moderators and staff who keep this community thriving.',
      image: null,
      date: '2026-03-15T12:00:00.000Z',
    },
    {
      id: 'seed-6',
      headline: 'New Boeing 787-9 Dreamliner Joined Fleet',
      category: 'Fleet',
      content: 'Expansive international service now includes the 787-9 featuring long-haul routes to Tokyo and London. The Dreamliner offers enhanced passenger comfort with lower cabin altitude and larger windows.',
      image: null,
      date: '2026-03-10T12:00:00.000Z',
    }
  ];
}

function getNews() {
  ensureDataFile();
  try {
    const raw = readFileSync(NEWS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return getSeedData();
  }
}

function saveNews(news: any[]) {
  ensureDataFile();
  writeFileSync(NEWS_FILE, JSON.stringify(news, null, 2));
}

function validateToken(token: string | null): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.includes(STAFF_PASSWORD);
  } catch {
    return false;
  }
}

// PUBLIC: Get all news posts (sorted newest first)
export async function GET() {
  const news = getNews();
  // Sort newest first
  news.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return NextResponse.json(news);
}

// STAFF ONLY: Create a new post
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const token = formData.get('token') as string;

    // Validate staff authentication
    if (!validateToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const headline = formData.get('headline') as string;
    const category = formData.get('category') as string;
    const content = formData.get('content') as string;
    const imageFile = formData.get('image') as File | null;
    const imageUrl = formData.get('image_url') as string | null;

    if (!headline || !category || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Handle image upload or pre-uploaded URL
    let imagePath: string | null = imageUrl || null;
    
    if (!imagePath && imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true });
      }
      
      const ext = imageFile.name.split('.').pop() || 'jpg';
      const filename = `news-${Date.now()}.${ext}`;
      writeFileSync(join(uploadsDir, filename), buffer);
      imagePath = `/uploads/${filename}`;
    }

    const newPost = {
      id: `post-${Date.now()}`,
      headline,
      category,
      content,
      image: imagePath,
      date: new Date().toISOString(),
    };

    const news = getNews();
    news.unshift(newPost);
    saveNews(news);

    return NextResponse.json({ success: true, post: newPost });
  } catch (err) {
    console.error('News POST error:', err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
