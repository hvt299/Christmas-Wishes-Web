import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  // Trang cần đăng nhập:
  // - /my-trees (quản lý danh sách cây của mình)
  // - /profile (quản lý thông tin tài khoản)
  // - /snowflake-game (săn bông tuyết)
  // - /mini-games (sảnh & các trò chơi mini)
  // Chú ý: /my-trees/[id] là trang công khai để bạn bè có thể xem cây thông và gửi quà!
  const isMyTreesRoot = pathname === '/my-trees' || pathname === '/my-trees/';
  const isProtectedRoute =
    isMyTreesRoot ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/snowflake-game') ||
    pathname.startsWith('/mini-games');

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/my-trees', request.url));
  }

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/forgot-password',
    '/reset-password',
    '/auth/verify',
    '/profile',
    '/my-trees',
    '/my-trees/:path*',
    '/snowflake-game',
    '/mini-games',
    '/mini-games/:path*',
  ],
};
