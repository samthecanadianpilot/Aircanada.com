import { NextResponse } from 'next/server';
import { getForms, saveForm } from '@/lib/database';

export async function GET() {
  try {
    const forms = await getForms();
    return NextResponse.json(forms);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    if (data.action === 'create') {
      const newId = "form-" + Date.now().toString();
      const newForm = { id: newId, isLive: false, isProtected: false, ...data.definition, responses: [] };
      await saveForm(newId, newForm);
      return NextResponse.json({ success: true, id: newId });
    }
    
    if (data.action === 'save') {
      await saveForm(data.formId, data.definition);
      return NextResponse.json({ success: true });
    }

    if (data.action === 'submit') {
      const forms = await getForms();
      const form = forms.find((f: any) => f.id === data.formId);
      if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });
      
      const newResponse = {
        id: "res-" + Date.now().toString(),
        timestamp: new Date().toISOString(),
        data: data.responses
      };
      
      form.responses.push(newResponse);
      await saveForm(form.id, form);
      
      return NextResponse.json({ success: true, id: newResponse.id });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process form action' }, { status: 500 });
  }
}
