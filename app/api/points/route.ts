// app/api/points/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { Auth } from 'firebase-admin/auth';
// import { getUserPoints } from '@/lib/db';  // your DB‐lookup helper

// Initialize on demand so builds and public pages do not require credentials.
async function getLoyaltyAuth(): Promise<Auth> {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) throw new Error('Loyalty is not configured');
  const [{ initializeApp, getApps, cert }, { getAuth }] = await Promise.all([
    import('firebase-admin/app'),
    import('firebase-admin/auth'),
  ]);
  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(serviceAccount)) });
  }
  return getAuth();
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const idToken = /^Bearer\s+(\S+)$/i.exec(authHeader)?.[1];
  if (!idToken) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }

  let auth: Auth;
  try {
    auth = await getLoyaltyAuth();
  } catch {
    return NextResponse.json({ error: 'Loyalty is temporarily unavailable' }, { status: 503 });
  }

  try {
    await auth.verifyIdToken(idToken);

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

  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
