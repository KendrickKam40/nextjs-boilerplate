// app/api/validate/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // 1) Parse body
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email } = body

  // 2) Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (typeof email !== 'string' || !emailRegex.test(email)) {
    return NextResponse.json({ error: 'Please supply a valid email address' }, { status: 422 })
  }

  // 3) Lookup points for that email (stubbed here)
  //    replace this with your DB / API call
  const points = 50

  // 4) Return it
  return NextResponse.json({ points })
}
