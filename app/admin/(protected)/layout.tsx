import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { verifySessionToken } from '@/lib/auth';

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  const isValid = verifySessionToken(token);
  if (!isValid) {
    redirect('/admin/login');
  }
  return children;
}
