import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const FORMS_FILE = join(DATA_DIR, 'forms.json');

function ensureDataFile() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(FORMS_FILE)) {
    const defaultForms = [
      {
        id: '1',
        name: 'Staff Application',
        isLive: true,
        isProtected: true,
        fields: [
          { id: 'f1', type: 'Short Text', label: 'Discord Username' },
          { id: 'f2', type: 'Long Text', label: 'Why do you want to join?' }
        ],
        responses: []
      }
    ];
    writeFileSync(FORMS_FILE, JSON.stringify(defaultForms, null, 2));
  }
}

function getForms() {
  ensureDataFile();
  try {
    const raw = readFileSync(FORMS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveForms(forms: any[]) {
  ensureDataFile();
  writeFileSync(FORMS_FILE, JSON.stringify(forms, null, 2));
}

// GET all forms (Definition)
export async function GET() {
  return NextResponse.json(getForms());
}

// POST: Create/Update form OR Submit response
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, formId, data, definition } = body;

    const forms = getForms();

    if (action === 'submit') {
      // User submitting a form
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      const formIdx = forms.findIndex((f: any) => f.id === formId);
      if (formIdx === -1) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

      const submission = {
        id: `res-${Date.now()}`,
        timestamp: new Date().toISOString(),
        data,
        ip
      };

      forms[formIdx].responses.unshift(submission);
      saveForms(forms);
      return NextResponse.json({ success: true });
    }

    if (action === 'save' || action === 'create') {
      // Staff saving form definition
      if (action === 'create') {
        const newForm = {
          id: `form-${Date.now()}`,
          name: definition.name || 'Untitled Form',
          isLive: false,
          isProtected: false,
          fields: definition.fields || [],
          responses: []
        };
        forms.push(newForm);
      } else {
        const formIdx = forms.findIndex((f: any) => f.id === formId);
        if (formIdx !== -1) {
          forms[formIdx] = { ...forms[formIdx], ...definition };
        }
      }
      saveForms(forms);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process form' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  const forms = getForms().filter((f: any) => f.id !== id);
  saveForms(forms);
  return NextResponse.json({ success: true });
}
