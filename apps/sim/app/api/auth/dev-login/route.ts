import { SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { isDev } from '@/lib/environment'

export async function POST(req: Request) {
  if (!isDev) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const { email, password } = await req.json()

    if (email === 'dev@localhost.lan' && password === 'Password1!') {
      const user = {
        id: 'dev-user',
        name: 'Dev User',
        email: 'dev@localhost.lan',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        stripeCustomerId: null,
      }

      const secret = new TextEncoder().encode(env.BETTER_AUTH_SECRET)
      const alg = 'HS256'

      const jwt = await new SignJWT({ user })
        .setProtectedHeader({ alg })
        .setExpirationTime('30d')
        .setIssuedAt()
        .sign(secret)

      cookies().set('better-auth.session-token', jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch (error: any) {
    console.error('Error in dev-login:', error)
    return NextResponse.json({ error: 'Something went wrong', details: error.message }, { status: 500 })
  }
}
