import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
  // Solo protegemos las rutas de /admin (excepto /admin/login)
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const payload = await verifyToken(token);

    if (!payload || payload.rol !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Rutas que requieren estar logueado (como /perfil o el checkout si lo protegemos)
  if (request.nextUrl.pathname.startsWith('/perfil')) {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      // Si no hay token, redirigimos a inicio para que abra el modal (o una página de login general)
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/perfil/:path*'],
};
