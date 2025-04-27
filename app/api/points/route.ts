// app/api/points/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
// import { getUserPoints } from '@/lib/db';  // your DB‐lookup helper

// Initialize Firebase Admin if not already initted
if (!getApps().length) {
  initializeApp({
    credential: cert(
      // Make sure FIREBASE_SERVICE_ACCOUNT contains the JSON string of your service account
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)
    ),
  });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const idToken = authHeader.split(' ')[1];
  if (!idToken) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    const uid = decoded.uid;

    // lookup actual points…
    const points = 100;
    return NextResponse.json({ points }, { status: 200 });

  } catch (e) {
    console.error('Token verification failed', e);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

