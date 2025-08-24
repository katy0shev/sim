import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
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

      const session = await auth.createSession({
        userId: user.id,
        user,
      })

      return NextResponse.json({ ...session })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
