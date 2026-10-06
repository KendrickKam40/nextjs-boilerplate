'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/** Only return to admin pages on this site, after resolving any `..` segments. */
function safeNext(next: string | null) {
  if (!next || typeof window === 'undefined') return '/admin';
  try {
    const url = new URL(next, window.location.origin);
    const inAdmin = url.pathname === '/admin' || url.pathname.startsWith('/admin/');
    if (url.origin !== window.location.origin || !inAdmin || url.pathname === '/admin/login') return '/admin';
    return `${url.pathname}${url.search}`;
  } catch {
    return '/admin';
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const destination = safeNext(searchParams.get('next'));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Sign-in didn’t work. Try again.');
        return;
      }
      router.push(destination);
      router.refresh();
    } catch {
      setError('Couldn’t reach the website. Check the internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-semibold">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'password-error' : undefined}
          className="min-h-11 w-full rounded-lg border border-[var(--a-line)] bg-[var(--a-surface)] px-3 text-base"
          required
        />
      </div>
      <div aria-live="polite">
        {error && (
          <p id="password-error" role="alert" className="text-sm font-semibold text-[var(--a-danger)]">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || !password}
        className="min-h-11 w-full rounded-lg bg-[var(--a-primary)] font-semibold text-[var(--a-on-primary)] hover:bg-[var(--a-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-[var(--a-line)] bg-[var(--a-surface)] p-6 shadow-sm">
        <header className="space-y-1">
          <p className="text-sm text-[var(--a-muted)]">Balibu</p>
          <h1 className="text-2xl font-bold">Sign in to website settings</h1>
          <p className="text-sm text-[var(--a-muted)]">For Balibu staff. Use the shared admin password.</p>
        </header>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
