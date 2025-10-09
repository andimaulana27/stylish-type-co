// src/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const rolePermissions: Record<string, string[]> = {
  admin: ['/admin'],
  blogger: ['/admin/blog'],
  uploader: ['/admin/products', '/admin/partners'],
};

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options, })
          response = NextResponse.next({ request: { headers: req.headers, }, })
          response.cookies.set({ name, value, ...options, })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options, })
          response = NextResponse.next({ request: { headers: req.headers, }, })
          response.cookies.set({ name, value: '', ...options, })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = req.nextUrl;
  
  if (user) {
    // --- PERBAIKAN DI SINI ---
    // Jika pengguna sudah login dan mencoba mengakses halaman login/register,
    // arahkan mereka pergi. JANGAN ikut campur dengan halaman /confirm.
    if (pathname === '/login' || pathname === '/register') {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        const userRole = profile?.role || 'user';
        
        let redirectUrl = '/account';
        if (userRole === 'admin') {
            redirectUrl = '/admin/dashboard';
        } else if (userRole === 'blogger') {
            redirectUrl = '/admin/blog';
        } else if (userRole === 'uploader') {
            redirectUrl = '/admin/products/fonts';
        }
        return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    // --- AKHIR PERBAIKAN ---

    if (pathname.startsWith('/admin')) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      const userRole = profile?.role || 'user';

      if ((userRole === 'blogger' || userRole === 'uploader') && pathname === '/admin/dashboard') {
          const redirectPath = userRole === 'blogger' ? '/admin/blog' : '/admin/products/fonts';
          return NextResponse.redirect(new URL(redirectPath, req.url));
      }

      const allowedPaths = rolePermissions[userRole];
      if (!allowedPaths || !allowedPaths.some(path => pathname.startsWith(path))) {
          return NextResponse.redirect(new URL('/', req.url));
      }
    }
  }

  if (!user && (pathname.startsWith('/account') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}