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
    console.log('Verifying token', idToken);
    const decoded = await getAuth().verifyIdToken(idToken);
    const uid = decoded.uid;

    console.log('Decoded token', decoded);

    // lookup actual point using Firebase API
    // https://firestore.googleapis.com/v1/$docPath/projects/$projectId/databases/(default)/documents/Clients/$companyId/Loyalty/$uid
    // headers: {
    //   'Authorization': 'Bearer $idToken',
    //   'Content-Type': 'application/json',
    // },
    // final docPath =
    //   'projects/$projectId/databases/(default)/documents/Clients/$companyId/Loyalty/$uid';

    const points = 100;
    return NextResponse.json({ points }, { status: 200 });

  } catch (e) {
    console.error('Token verification failed', e);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

