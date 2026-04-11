import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/staff')) {
    const session = request.cookies.get('staff_session')?.value;
    const masterKey = process.env.STAFF_KEY || 'gamo123';

    if (!session || session !== masterKey) {
      if (pathname === '/staff-gate') return NextResponse.next();
      
      const url = request.nextUrl.clone();
      url.pathname = '/staff-gate';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/staff/:path*', '/staff-gate'],
};
