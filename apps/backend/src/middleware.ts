import { NextRequest, NextResponse } from 'next/server'

// En dev, no hay autenticación real — el auth.ts usa un usuario mock
export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico)).*)', '/(api|trpc)(.*)'],
}
