import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/' || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const email = request.cookies.get('user_email')?.value

  if (!email) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('suscripciones')
    .select('estado')
    .eq('email', email)
    .eq('estado', 'authorized')
    .single()

  if (!data) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
}