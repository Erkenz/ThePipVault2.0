// src/proxy.ts
import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

// De functie heet nu 'proxy' in plaats van 'middleware'
export async function proxy(request: NextRequest) {
  // TEST LOG: Laten we kijken of hij nu netjes afvuurt
  console.log("Proxy aangeroepen op pad:", request.nextUrl.pathname);
  
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match alle requests, behalve:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Alle bestanden met een extensie
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};