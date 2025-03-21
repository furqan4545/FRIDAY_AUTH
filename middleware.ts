import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip all middleware and let client-side auth handle everything
  return NextResponse.next()
}

// Configure minimal matcher
export const config = {
  matcher: [],
} 